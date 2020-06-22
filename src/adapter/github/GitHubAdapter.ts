import { IMSAdapter } from "../IMSAdapter";
import { Issue } from "../../domain/issues/Issue";
import { IssueComment } from "../../domain/issues/IssueComment";
import { IMSData } from "../IMSData";
import { GraphQLClient } from "graphql-request";
import { User } from "../../domain/users/User";
import { Component } from "../../domain/components/Component";
import { IssueRequest, CommentRequest, CreateIssueMutation, RepositoryIdRequest, RemoveIssueMutation } from "./GitHubGraphqlTypes";
import { DBClient } from "../../domain/DBClient";
import { GitHubCredential } from "./GitHubCredential";
import { GitHubImsData } from "./GitHubIMSData";
import { GitHubIMSInfo } from "./GitHubIMSInfo";
import { IMSType } from "../IMSType";
import { IssueType } from "../../domain/issues/IssueType";

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
            repository(name:"${this._imsData.repository}", owner:"${this._imsData.owner}") {
                issues (first: 100) {
                    nodes {
                        author {
                            login
                        }
                        body
                        closed
                        title
                        createdAt
                    }
                }
            }
        }`).then(async (response: IssueRequest): Promise<Issue> => {
            const issueData = response.node;
            const findMetadataRegex = new RegExp("```ccims\n.*?\n```\n", "g");
            const metadata = GitHubAdapter.toIssueMetadata(JSON.parse((findMetadataRegex.exec(issueData.body) || ["{}"])[0]));
            const restBody = issueData.body.substr(findMetadataRegex.lastIndex);
            const component = await Component.load(this._dbClient, metadata.componentId);
            const user = await User.load(this._dbClient, metadata.creatorId);
            return new Issue(issueData.id, component, user, new Date(issueData.createdAt), issueData.title, restBody, !issueData.closed, metadata.linkedIssues, metadata.type);
        });
    }

    async createIssue(user: User, title: string, body: string, type: IssueType): Promise<Issue> {
        const imsInfo = await this._component.getIMSInfo();
        const extraInfo = "```ccims\n" + JSON.stringify({
            componentId: this._component.id,
            creatorId: user.id,
            linkedIssues: new Array<BigInt>()
        }, null, 4) + "\n```\n";
        const finishedBody = extraInfo + body;
        return (await this.getRequest(user)).request<CreateIssueMutation>(`mutation CreateIssue {
            createIssue(input: {
              repositoryId: "${this._imsData.repositoryId}", 
              title: "${title}", 
              body: "${body}"}) {
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

    async removeIssue(user: User, issue: Issue): Promise<boolean> {
        const imsInfo = await this._component.getIMSInfo();
        return (await this.getRequest(user)).request<RemoveIssueMutation>(`mutation DeleteIssue {
            deleteIssue(input:{
              issueId:"${issue.id}"
            }) {
              clientMutationId
            }
          }
          `).then((response: RemoveIssueMutation): boolean => true).catch((error): boolean => false);
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

    private static isGithubImsData(imsData: IMSData) {
        const githubData = imsData as GitHubImsData;
        return typeof githubData.repository === "string" && typeof githubData.owner === "string";
    }

    private static toIssueMetadata(data: IssueMetadata): IssueMetadata {
        const newData: IssueMetadata = {
            componentId: 0n,
            creatorId: 0n,
            linkedIssues: [],
            type: IssueType.UNCLASSIFIED
        }
        if (typeof data.componentId === "string" || typeof data.componentId === "number") {
            newData.componentId = BigInt(data.componentId);
        } else if (typeof data.componentId == "bigint") {
            newData.componentId = data.componentId;
        } else {
            throw new Error("The Issue metadata of the issue are incorrect");
        }
        if (typeof data.creatorId === "string" || typeof data.creatorId === "number") {
            newData.creatorId = BigInt(data.creatorId);
        } else if (typeof data.creatorId == "bigint") {
            newData.creatorId = data.creatorId;
        } else {
            throw new Error("The Issue metadata of the issue are incorrect");
        }
        if (typeof data.linkedIssues !== "undefined" && data.linkedIssues instanceof Array) {
            data.linkedIssues.forEach(issueId => {
                if (typeof issueId === "string") {
                    newData.linkedIssues.push(issueId);
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
    componentId: BigInt,
    creatorId: BigInt,
    linkedIssues: Array<string>,
    type: IssueType
}