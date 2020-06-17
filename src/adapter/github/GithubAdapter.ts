import { IMSAdapter } from "../IMSAdapter";
import { Issue } from "../../domain/issues/Issue";
import { IssueComment } from "../../domain/issues/IssueComment";
import { IMSData } from "../IMSData";
import { GraphQLClient } from "graphql-request";
import { User } from "../../domain/users/User";
import { Component } from "../../domain/components/Component";
import * as githubTypes from "./GithubGraphqlTypes";
import { DBClient } from "../../domain/DBClient";
import { GitHubCredential } from "./GitHubCredential";

export class GithubAdapter implements IMSAdapter {

    private _url: string;
    private _imsData: GithubImsData;
    private _component: Component;
    private _dbClient: DBClient;

    constructor(url: string, imsData: IMSData, component: Component, dbClient: DBClient) {
        if (!GithubAdapter.isGithubImsData(imsData)) {
            throw new Error("The given ims Data wasn't github ims data");
        }
        this._url = url;
        this._imsData = imsData as GithubImsData;
        this._component = component;
        this._dbClient = dbClient;
    }

    async getIssues(user: User): Promise<Issue[]> {
        const client = new GraphQLClient(this._url, {
            headers: {
                authorization: (user.getIMSCredential(await this._component.getIMSInfo()) as GitHubCredential).oAuthToken
            }
        });
        return client.request<githubTypes.IssueRequest>(`query {
            repository(name:"` + this._imsData.repository + `", owner:"` + this._imsData.owner + `") {
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
        }`).then((response: githubTypes.IssueRequest): Issue[] => {
            return response.repository.issues.nodes.map(issue => new Issue(issue.id, this._component, this._dbClient.getUser(issue.author.login), new Date(issue.createdAt), issue.title, issue.body));
        });
    }

    async getComments(issue: Issue, user: User): Promise<IssueComment[]> {
        const client = new GraphQLClient(this._url, {
            headers: {
                authorization: (user.getIMSCredential(await this._component.getIMSInfo()) as GitHubCredential).oAuthToken
            }
        });
        return client.request<githubTypes.CommentRequest>(`query {
            node(id:"` + issue.id + `") {
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
        }`).then((response: githubTypes.CommentRequest): IssueComment[] => {
            return response.node.comments.nodes.map(comment => new IssueComment(this._dbClient.getUser(comment.author.login), comment.body, new Date(comment.createdAt)));
        });
    }

    private static isGithubImsData(imsData: IMSData) {
        const githubData = imsData as GithubImsData;
        return typeof githubData.repository === "string" && typeof githubData.owner === "string";
    }

}

interface GithubImsData extends IMSData {
    repository: string;
    owner: string;
}