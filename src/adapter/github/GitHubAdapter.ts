import { IMSAdapter } from "../IMSAdapter";
import { Issue } from "../../domain/issues/Issue";
import { IssueComment } from "../../domain/issues/IssueComment";
import { IMSData } from "../IMSData";
import { GraphQLClient } from "graphql-request";
import { User } from "../../domain/users/User";
import { Component } from "../../domain/components/Component";
import { IssueRequest, CommentRequest, CreateIssueMutation, RepositoryIdRequest } from "./GitHubGraphqlTypes";
import { DBClient } from "../../domain/DBClient";
import { GitHubCredential } from "./GitHubCredential";
import { GitHubImsData } from "./GitHubIMSData";
import { GitHubIMSInfo } from "./GitHubIMSInfo";
import { IMSType } from "../IMSType";

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
            this._imsData = {
                repository: this._imsData.repository,
                owner: this._imsData.owner,
                repositoryId: (await (await new GraphQLClient(imsInfo.endpoint, {
                    headers: {
                        authorization: (user.getIMSCredential(await this._component.getIMSInfo()) as GitHubCredential).oAuthToken
                    }
                })).request<RepositoryIdRequest>(`query {
                    repository(name: "${this._imsData.repository}", owner: "${this._imsData.owner}"){
                        id
                        }
                    }`)).repository.id,
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
        this.checkImsData(user);
        return new GraphQLClient(imsInfo.endpoint, {
            headers: {
                authorization: (user.getIMSCredential(imsInfo) as GitHubCredential).oAuthToken
            }
        });
    }

    async getIssues(user: User): Promise<Issue[]> {
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
        }`).then((response: IssueRequest): Issue[] => {
            let issues: Issue[] = new Array();
            response.repository.issues.nodes.forEach(async issue => {
                const user = await this._dbClient.getUserByUsername(issue.author.login);
                issues.push(new Issue(issue.id, this._component, user, new Date(issue.createdAt), issue.title, issue.body))
            });
            return issues;
        });
    }

    async createIssue(user: User, title: string, body: string): Promise<Issue> {
        const imsInfo = await this._component.getIMSInfo();
        return (await this.getRequest(user)).request<CreateIssueMutation>(`mutation CreateIssue {
            createIssue(input: {
              repositoryId: "${this._imsData.repositoryId}", 
              title: "${title}", 
              body: "${body}"}) {
              issue {
                id
                createdAt
              }
            }
          }`).then((response: CreateIssueMutation): Issue => {
            return new Issue(response.createIssue.issue.id, this._component, user, new Date(response.createIssue.issue.createdAt), title, body);
        });
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

}