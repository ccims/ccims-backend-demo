import { IMSAdapter } from "../IMSAdapter";
import { Issue } from "../../domain/issues/Issue";
import { IssueComment } from "../../domain/issues/IssueComment";
import { IMSData } from "../IMSData";
import { GraphQLClient } from "graphql-request";
import { User } from "../../domain/users/User";
import { Component } from "../../domain/components/Component";
import { IssueRequest, CommentRequest, CreateIssueMutation, RepositoryIdRequest, RemoveIssueMutation, ModifyIssueMutation, ReopenIssueMutation, CloseIssueMutation } from "./GitHubGraphqlTypes";
import { DBClient } from "../../domain/DBClient";
import { GitHubCredential } from "./GitHubCredential";
import { GitHubImsData } from "./GitHubIMSData";
import { GitHubIMSInfo } from "./GitHubIMSInfo";
import { IMSType } from "../IMSType";
import { IssueType } from "../../domain/issues/IssueType";
import { IssueRelation, IssueRelationType } from "../../domain/issues/IssueRelation";

export class GitHubAdapter implements IMSAdapter {

    private _imsData: GitHubImsData;
    private _component: Component;
    private _dbClient: DBClient;

    constructor(component: Component, dbClient: DBClient) {
        if (!GitHubAdapter.isGithubImsData(component.imsData)) {
            throw new Error("The given ims Data wasn't github ims data");
        }
        this._component = component;
        this._imsData = component.imsData as GitHubImsData;
        this._dbClient = dbClient;
    }

    private async checkImsData(user: User): Promise<void> {
        if (typeof this._imsData.repositoryId !== "string" || this._imsData.repositoryId.length <= 0) {
            const imsInfo = await this._component.getIMSInfo() as GitHubIMSInfo;
            if (imsInfo.type != IMSType.GitHub) {
                throw new Error("The given ims type isn't a github ims type was invalid.");
            }
            const authHead = "token " + (user.getIMSCredential(await this._component.getIMSInfo()) as GitHubCredential).oAuthToken;
            const repositoryData = await new GraphQLClient(imsInfo.endpoint, {
                headers: {
                    authorization: authHead
                }
            }).request<RepositoryIdRequest>(`query {
                repository(name: "${this._imsData.repository}", owner: "${this._imsData.owner}"){
                    id
                    }
                }`);
            this._imsData = {
                repository: this._imsData.repository,
                owner: this._imsData.owner,
                repositoryId: repositoryData.repository.id,
            };
            this._component.imsData = this._imsData;
            this._component.saveToDB();
        }
    }

    private async getRequest(user: User): Promise<GraphQLClient> {
        const imsInfo = await this._component.getIMSInfo() as GitHubIMSInfo;
        if (imsInfo.type != IMSType.GitHub) {
            throw new Error("The given ims type isn't a github ims type was invalid.");
        }
        await this.checkImsData(user);
        return new GraphQLClient(imsInfo.endpoint, {
            headers: {
                authorization: "token " + (user.getIMSCredential(imsInfo) as GitHubCredential).oAuthToken
            }
        });
    }

    async getIssue(user: User, id: string): Promise<Issue> {
        return (await this.getRequest(user)).request<IssueRequest>(`query {
            node(id: "${id}") {
                ... on Issue {
                  id
                  createdAt
                  title
                  body
                  closed
                }
              }
        }`).then(async (response: IssueRequest): Promise<Issue> => {
            const metaParsed = this.parseMetadataBody(response.node.body);
            const component = await this._dbClient.getComponent(metaParsed.metadata.componentId);
            const user = await this._dbClient.getUser(metaParsed.metadata.creatorId);
            return new Issue(response.node.id, component, user, new Date(response.node.createdAt), response.node.title, metaParsed.bodyText, !response.node.closed, metaParsed.metadata.linkedIssues, metaParsed.metadata.type);
        });
    }

    async createIssue(user: User, title: string, body: string, type: IssueType): Promise<Issue> {
        const imsInfo = await this._component.getIMSInfo();
        return (await this.getRequest(user)).request<CreateIssueMutation>(`mutation CreateIssue {
            createIssue(input: {
              repositoryId: "${this._imsData.repositoryId}", 
              title: "${title}", 
              body: "${this.createMetadataBodyNewIssue(user, body)}"}) {
              issue {
                id
                createdAt
                closed
              }
            }
          }`).then((response: CreateIssueMutation): Issue => {
            return new Issue(response.createIssue.issue.id, this._component, user, new Date(response.createIssue.issue.createdAt), title, body, !response.createIssue.issue.closed, [], type);
        });
    }

    async updateIssue(user: User, issue: Issue): Promise<boolean> {
        const imsInfo = await this._component.getIMSInfo();
        let setParams = "";
        if (issue.fieldsToSave.body) {
            setParams += `body: "${this.createMetadataBodyByIssue(user, issue)}"\n`;
        }
        if (issue.fieldsToSave.title) {
            setParams += `title: "${issue.title}"\n`;
        }
        if (issue.fieldsToSave.issueRelations) {
            setParams += `body: "${this.createMetadataBodyByIssue(user, issue)}"\n`;
        }
        if (issue.fieldsToSave.type) {
            setParams += `body: "${this.createMetadataBodyByIssue(user, issue)}"\n`;
        }
        return (await this.getRequest(user)).request<ModifyIssueMutation>(`mutation UpdateIssue {
            updateIssue(input:{
              id: "${issue.id}"
              ${setParams}
            }) {
              clientMutationId
            }
          }`).then((response: ModifyIssueMutation): boolean => {
            return true;
        });
    }

    async reopenIssue(user: User, issue: Issue): Promise<boolean> {
        const imsInfo = await this._component.getIMSInfo();
        return (await this.getRequest(user)).request<ReopenIssueMutation>(`mutation ReopenIssue {
            reopenIssue(input:{
              issueId: "${issue.id}"
            }) {
              clientMutationId
            }
          }`).then((response: ReopenIssueMutation): boolean => {
            return true;
        });
    }

    async closeIssue(user: User, issue: Issue): Promise<boolean> {
        const imsInfo = await this._component.getIMSInfo();
        return (await this.getRequest(user)).request<CloseIssueMutation>(`mutation ReopenIssue {
            closeIssue(input:{
              issueId: "${issue.id}"
            }) {
              clientMutationId
            }
          }`).then((response: CloseIssueMutation): boolean => {
            return true;
        });
    }

    async removeIssue(user: User, issue: Issue): Promise<boolean> {
        const imsInfo = await this._component.getIMSInfo();
        return (await this.getRequest(user)).request<RemoveIssueMutation>(`mutation DeleteIssue {
            deleteIssue(input:{
              issueId:"${issue.id}"
            }) {
              clientMutationId
            }
          }
          `).then((_response: RemoveIssueMutation): boolean => true);
    }

    async getComments(issue: Issue, user: User): Promise<IssueComment[]> {
        return (await this.getRequest(user)).request<CommentRequest>(`query {
            node(id:"${issue.id}") {
                comments (first: 100) {
                    nodes {
                        author {
                            login
                        }
                        body
                        createdAt
                    }
                }
            }
        }`).then((response: CommentRequest): IssueComment[] => {
            let comments: IssueComment[] = new Array();
            response.node.comments.nodes.forEach(async comment => {
                const user = await this._dbClient.getUserByUsername(comment.author.login);
                comments.push(new IssueComment(user, comment.body, new Date(comment.createdAt)));
            });
            return comments;
        });
    }

    private createMetadataBodyByIssue(user: User, issue: Issue): string {
        return this.createMetadataBody(issue.component, user, issue.issueRelations, issue.type, issue.body);
    }

    private createMetadataBodyNewIssue(user: User, bodyText: string): string {
        return this.createMetadataBody(this._component, user, [], IssueType.UNCLASSIFIED, bodyText);
    }

    private createMetadataBody(component: Component, creator: User, relatedIssues: IssueRelation[], type: IssueType, bodyText: string): string {
        const metadata: IssueMetadata = {
            componentId: component.id,
            creatorId: creator.id,
            linkedIssues: relatedIssues,
            type: type
        };
        const extraInfo = "```ccims\n" + JSON.stringify(metadata, null, 4) + "\n```\n";
        return (extraInfo + bodyText).replace(/"/g, '\\"');
    }

    private parseMetadataBody(body: string): { bodyText: string, metadata: IssueMetadata } {
        const findMetadataRegex = new RegExp(/```ccims\r?\n((.|\r?\n)*?)\r?\n```\r?\n/gm, "gm");
        const matchedPart = findMetadataRegex.exec(body);
        const metadata = GitHubAdapter.toIssueMetadata(JSON.parse((matchedPart || ["{}"])[1]));
        return { bodyText: body.substr(findMetadataRegex.lastIndex), metadata: metadata };
    }

    private static isGithubImsData(imsData: IMSData) {
        const githubData = imsData as GitHubImsData;
        return typeof githubData.repository === "string" && typeof githubData.owner === "string";
    }

    private static toIssueMetadata(data: IssueMetadata): IssueMetadata {
        const newData: IssueMetadata = {
            componentId: "0",
            creatorId: "0",
            linkedIssues: [],
            type: IssueType.UNCLASSIFIED
        }
        if (typeof data.componentId === "string") {
            newData.componentId = data.componentId;
        } else {
            throw new Error("The Issue metadata of the issue are incorrect");
        }
        if (typeof data.creatorId === "string") {
            newData.creatorId = data.creatorId;
        } else {
            throw new Error("The Issue metadata of the issue are incorrect");
        }
        if (typeof data.linkedIssues !== "undefined" && data.linkedIssues instanceof Array) {
            data.linkedIssues.forEach((relation: Object) => {
                const relationData = relation as { _sourceIssue: Object, _destIssue: Object, _sourceComponent: Object, _destComponent: Object, _relationType: Object };
                if (typeof relation === "object" && typeof relationData._sourceIssue === "string" && typeof relationData._destIssue === "string" && typeof relationData._sourceComponent === "string" && typeof relationData._destComponent === "string" && typeof relationData._relationType === "string") {
                    newData.linkedIssues.push(new IssueRelation(relationData._relationType as IssueRelationType, relationData._sourceIssue, relationData._sourceComponent, relationData._destIssue, relationData._sourceComponent));
                } else {
                    throw new Error("The Issue metadata of the issue are incorrect");
                }
            });
        } else {
            throw new Error("The Issue metadata of the issue are incorrect");
        }
        if (typeof IssueType[data.type] !== "undefined") {
            newData.type = IssueType[data.type];
        }
        return newData;
    }

}

interface IssueMetadata {
    componentId: string,
    creatorId: string,
    linkedIssues: Array<IssueRelation>,
    type: IssueType
}