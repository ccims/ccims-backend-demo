import { IMSAdapter } from "../IMSAdapter";
import { Issue } from "../../domain/issues/Issue";
import { IssueComment } from "../../domain/issues/IssueComment";
import { IMSData } from "../IMSData";
import { GraphQLClient } from "graphql-request";
import { User } from "../../domain/users/User";
import { Component } from "../../domain/components/Component";
import { ComponentInterface } from "../../domain/components/ComponentInterface";
import { IssueRequest, CommentRequest, CreateIssueMutation, RepositoryIdRequest, RemoveIssueMutation, ModifyIssueMutation, ReopenIssueMutation, CloseIssueMutation, AllIssueRequest } from "./GitHubGraphqlTypes";
import { DBClient } from "../../domain/DBClient";
import { GitHubCredential } from "./GitHubCredential";
import { GitHubImsData } from "./GitHubIMSData";
import { GitHubIMSInfo } from "./GitHubIMSInfo";
import { IMSType } from "../IMSType";
import { IssueType } from "../../domain/issues/IssueType";
import { IssueRelation, IssueRelationType } from "../../domain/issues/IssueRelation";
import { fieldsConflictMessage } from "graphql/validation/rules/OverlappingFieldsCanBeMerged";

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
            const authHead = "token " + (user.getIMSCredential(imsInfo) as GitHubCredential).oAuthToken;
            const repositoryData = await new GraphQLClient(imsInfo.endpoint, {
                headers: {
                    authorization: authHead
                }
            }).request<RepositoryIdRequest>(`query getRepositoryId($repositoryName: String!, $repositoryOwner: String!) {
                repository(name: $repositoryName, owner: $repositoryOwner){
                    id
                    }
                }`,
                {
                    repositoryName: this._imsData.repository,
                    repositoryOwner: this._imsData.owner
                });
            this._imsData = {
                repository: this._imsData.repository,
                owner: this._imsData.owner,
                repositoryId: repositoryData.repository.id,
            };
            this._component.imsData = this._imsData;
            await this._dbClient.save();
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
        return (await this.getRequest(user)).request<IssueRequest>(`query SingleIssueRequest($issueId: ID!) {
            node(id: $issueId) {
                ... on Issue {
                  id
                  createdAt
                  title
                  body
                  closed
                }
              }
        }`,
            {
                issueId: id
            }
        ).then(async (response: IssueRequest): Promise<Issue> => {
            const metaParsed = this.parseMetadataBody(response.node.body, user);
            const component = await this._dbClient.getComponent(metaParsed.metadata.componentId);
            const creatorUser = await this._dbClient.getUser(metaParsed.metadata.creatorId);
            return new Issue(response.node.id, component, creatorUser, new Date(response.node.createdAt), response.node.title, metaParsed.bodyText, !response.node.closed, metaParsed.metadata.linkedIssues, metaParsed.metadata.type, new Set<string>(metaParsed.metadata.interfaces));
        });
    }

    async createIssue(user: User, title: string, body: string, type: IssueType, interfaceIds: Set<string>): Promise<Issue> {
        const imsInfo = await this._component.getIMSInfo();
        return (await this.getRequest(user)).request<CreateIssueMutation>(`mutation CreateIssue($repositoryId: ID!, $title: String, $body: String) {
            createIssue(input: {
              repositoryId: $repositoryId, 
              title: $title, 
              body: $body}) {
              issue {
                id
                createdAt
                closed
              }
            }
          }`,
            {
                repositoryId: this._imsData.repositoryId,
                title: title,
                body: this.createMetadataBodyNewIssue(user, [...interfaceIds], body)
            }
        ).then(async (response: CreateIssueMutation): Promise<Issue> => {
            return new Issue(response.createIssue.issue.id, this._component, user, new Date(response.createIssue.issue.createdAt), title, body, !response.createIssue.issue.closed, [], type, interfaceIds);
        });
    }

    async updateIssue(user: User, issue: Issue): Promise<boolean> {
        const imsInfo = await this._component.getIMSInfo();
        let setParams = "";
        let usedVariables = new Array<string>();
        usedVariables.push("$issueId: ID!")
        if (issue.fieldsToSave.body || issue.fieldsToSave.issueRelations || issue.fieldsToSave.type || issue.fieldsToSave.interfaces) {
            setParams += `body: $body\n`;
            usedVariables.push("$body: String");
        }
        if (issue.fieldsToSave.title) {
            setParams += `title: $title\n`;
            usedVariables.push("$title: String");
        }
        return (await this.getRequest(user)).request<ModifyIssueMutation>(`mutation UpdateIssue(${usedVariables.join(", ")})  {
            updateIssue(input:{
              id: $issueId
              ${setParams}
            }) {
              clientMutationId
            }
          }`,
            {
                issueId: issue.id,
                body: this.createMetadataBodyByIssue(user, issue),
                title: issue.title,
            }
        ).then((response: ModifyIssueMutation): boolean => {
            return true;
        });
    }

    async reopenIssue(user: User, issue: Issue): Promise<boolean> {
        const imsInfo = await this._component.getIMSInfo();
        return (await this.getRequest(user)).request<ReopenIssueMutation>(`mutation ReopenIssue($issueId: ID!)  {
            reopenIssue(input:{
              issueId: $issueId
            }) {
              clientMutationId
            }
          }`,
            {
                issueId: issue.id
            }
        ).then((response: ReopenIssueMutation): boolean => {
            return true;
        });
    }

    async closeIssue(user: User, issue: Issue): Promise<boolean> {
        const imsInfo = await this._component.getIMSInfo();
        return (await this.getRequest(user)).request<CloseIssueMutation>(`mutation CloseIssue($issueId: ID!)  {
            closeIssue(input:{
              issueId: $issueId
            }) {
              clientMutationId
            }
          }`,
            {
                issueId: issue.id
            }
        ).then((response: CloseIssueMutation): boolean => {
            return true;
        });
    }

    async removeIssue(user: User, issue: Issue): Promise<boolean> {
        const imsInfo = await this._component.getIMSInfo();
        return (await this.getRequest(user)).request<RemoveIssueMutation>(`mutation DeleteIssue($issueId: ID!) {
            deleteIssue(input:{
              issueId: $issueId
            }) {
              clientMutationId
            }
          }
          `,
            {
                issueId: issue.id
            }
        ).then((_response: RemoveIssueMutation): boolean => true);
    }

    async getComments(issue: Issue, user: User): Promise<IssueComment[]> {
        return (await this.getRequest(user)).request<CommentRequest>(`query($issueId: ID!) {
            node(id: $issueId) {
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
        }`,
            {
                issueId: issue.id
            }
        ).then((response: CommentRequest): IssueComment[] => {
            let comments: IssueComment[] = new Array();
            response.node.comments.nodes.forEach(async comment => {
                const creatorUser = await this._dbClient.getUserByUsername(comment.author.login);
                comments.push(new IssueComment(creatorUser, comment.body, new Date(comment.createdAt)));
            });
            return comments;
        });
    }

    public async getAllIssues(user: User): Promise<Issue[]> {
        if (this._imsData.repositoryId) {
            return (await this.getRequest(user)).request<AllIssueRequest>(`query getAllIssues($repositoryId: ID!) {
            node(id: $repositoryId) {
              ... on Repository {
                issues(first: 100) {
                  nodes {
                    id
                    createdAt
                    title
                    body
                    closed
                  }
                }
              }
            }
          }`,
                {
                    repositoryId: this._imsData.repositoryId
                }
            ).then(async (response: AllIssueRequest): Promise<Issue[]> => {
                return Promise.all(response.node.issues.nodes.map(async (issue): Promise<Issue> => {
                    const metaParsed = this.parseMetadataBody(issue.body, user);
                    const component = await this._dbClient.getComponent(metaParsed.metadata.componentId);
                    const creatorUser = await this._dbClient.getUser(metaParsed.metadata.creatorId);
                    return new Issue(issue.id, component, creatorUser, new Date(issue.createdAt), issue.title, metaParsed.bodyText, !issue.closed, metaParsed.metadata.linkedIssues, metaParsed.metadata.type, new Set<string>(metaParsed.metadata.interfaces));
                }));
            }).catch(err => { console.log("Error in issue loading: ", err); throw new Error(err); });
        } else {
            return [];
        }
    }

    private createMetadataBodyByIssue(user: User, issue: Issue): string {
        return this.createMetadataBody(issue.component, user, issue.issueRelations, issue.type, issue.componentInterfaceIds, issue.body);
    }

    private createMetadataBodyNewIssue(user: User, interfaceIds: string[], bodyText: string): string {
        return this.createMetadataBody(this._component, user, [], IssueType.UNCLASSIFIED, interfaceIds, bodyText);
    }

    private createMetadataBody(component: Component, creator: User, relatedIssues: IssueRelation[], type: IssueType, interfaceIds: string[], bodyText: string): string {
        const metadata: IssueMetadata = {
            componentId: component.id,
            creatorId: creator.id,
            linkedIssues: relatedIssues,
            type: type,
            interfaces: interfaceIds
        };
        const extraInfo = "```ccims\n" + JSON.stringify(metadata, null, 4) + "\n```\n";
        return (extraInfo + bodyText);
    }

    private parseMetadataBody(body: string, user: User): { bodyText: string, metadata: IssueMetadata } {
        let actualBody = body;
        try {
            const findMetadataRegex = new RegExp(/```ccims\r?\n((.|\r?\n)*?)\r?\n```\r?\n/gm, "gm");
            const matchedPart = findMetadataRegex.exec(actualBody);
            if (!matchedPart || matchedPart.length < 2) {
                return { bodyText: actualBody, metadata: this.generateIssueStubMetadata(user) };
            }
            actualBody = body.substr(findMetadataRegex.lastIndex);
            const parsedMetadataObj = JSON.parse(matchedPart[1]);
            if (!parsedMetadataObj) {
                return { bodyText: actualBody, metadata: this.generateIssueStubMetadata(user) };
            }
            const metadata = GitHubAdapter.toIssueMetadata(parsedMetadataObj);
            if (!metadata) {
                return { bodyText: actualBody, metadata: this.generateIssueStubMetadata(user) };
            } else {
                return { bodyText: actualBody, metadata: metadata };
            }
        } catch (e) {
            return { bodyText: actualBody, metadata: this.generateIssueStubMetadata(user) };
        }
    }

    private generateIssueStubMetadata(user: User): IssueMetadata {
        return {
            componentId: this._component.id,
            creatorId: user.id,
            linkedIssues: [],
            type: IssueType.UNCLASSIFIED,
            interfaces: []
        };
    }

    private static isGithubImsData(imsData: IMSData) {
        const githubData = imsData as GitHubImsData;
        return typeof githubData.repository === "string" && typeof githubData.owner === "string";
    }

    private static toIssueMetadata(data: IssueMetadata): IssueMetadata | null {
        const newData: IssueMetadata = {
            componentId: "0",
            creatorId: "0",
            linkedIssues: [],
            type: IssueType.UNCLASSIFIED,
            interfaces: []
        }
        if (typeof data.componentId === "string") {
            newData.componentId = data.componentId;
        } else {
            return null;
        }
        if (typeof data.creatorId === "string") {
            newData.creatorId = data.creatorId;
        } else {
            return null;
        }
        if (typeof data.linkedIssues !== "undefined" && data.linkedIssues instanceof Array) {
            data.linkedIssues.forEach((relation: Object) => {
                const relationData = relation as { _sourceIssue: Object, _destIssue: Object, _sourceComponent: Object, _destComponent: Object, _relationType: Object };
                if (typeof relation === "object" && typeof relationData._sourceIssue === "string" && typeof relationData._destIssue === "string" && typeof relationData._sourceComponent === "string" && typeof relationData._destComponent === "string" && typeof relationData._relationType === "string") {
                    newData.linkedIssues.push(new IssueRelation(relationData._relationType as IssueRelationType, relationData._sourceIssue, relationData._sourceComponent, relationData._destIssue, relationData._sourceComponent));
                }
            });
        } else {
            return null;
        }
        if (typeof data.type !== "undefined" && typeof IssueType[data.type] !== "undefined") {
            newData.type = IssueType[data.type];
        }
        if (typeof data.interfaces !== "undefined" && data.interfaces instanceof Array) {
            data.interfaces.forEach((componentInterface: Object) => {
                if (typeof componentInterface === "string") {
                    newData.interfaces.push(componentInterface);
                }
            });
        } else {
            return null;
        }
        return newData;
    }

}

interface IssueMetadata {
    componentId: string,
    creatorId: string,
    linkedIssues: Array<IssueRelation>,
    type: IssueType,
    interfaces: Array<string>
}