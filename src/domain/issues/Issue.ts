import { User } from "../users/User";
import { Component } from "../components/Component";
import { IssueComment } from "./IssueComment";
import { Client } from "pg";
import { DatabaseElement } from "../DatabaseElement";
import { DBClient } from "../DBClient";
import { GitHubAdapter } from "../../adapter/github/GitHubAdapter";

export class Issue {

    private readonly _creator: User;

    private _comments: IssueComment[];

    private readonly _creationDate: Date;

    private readonly _component: Component;

    private _linkedIssues: string[]

    private _body: string;

    private _title: string;

    private _id: string;

    public constructor(id: string, component: Component, creator: User, creationDate: Date, title: string, body: string) {
        this._component = component;
        this._creator = creator;
        this._creationDate = creationDate;
        this._comments = [];
        this._linkedIssues = [];
        this._title = title;
        this._body = body;
        this._id = id;
    }

    private refreshLinkedIssues() {
        this._linkedIssues = []
        //this._comments.forEach(comment => )
    }

    public createComment(asUser: User, body: string, creationDate: Date): IssueComment {
        return new IssueComment(asUser, body, creationDate);
    }

    /**
     * add an alredy existing IssueComment to this Issue
     * @param comment 
     */
    public addComment(comment: IssueComment): void {
        this.refreshLinkedIssues();
    }

    public get creator(): User {
        return this._creator;
    }

    public get comments(): IssueComment[] {
        return this._comments;
    }

    public get creationDate(): Date {
        return this._creationDate;
    }

    public get title(): string {
        return this._title;
    }

    public get body(): string {
        return this._title;
    }

    public get id(): string {
        return this._id;
    }

    public set id(id: string) {
        this._id = id;
    }

    public static async create(component: Component, creator: User, title: string, body: string, dbClient: DBClient): Issue {
        return new GitHubAdapter(component, dbClient).createIssue(creator, title, body);
    }
}