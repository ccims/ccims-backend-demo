import { User } from "../users/User";
import { Component } from "../components/Component";
import { IssueComment } from "./IssueComment";
import { Client } from "pg";
import { DatabaseElement } from "../DatabaseElement";
import { DBClient } from "../DBClient";
import { GitHubAdapter } from "../../adapter/github/GitHubAdapter";
import { getIMSAdapter } from "../../adapter/IMSAdapterFactory";
import { IssueType } from "./IssueType";

export class Issue {

    private readonly _creator: User;

    //private _comments: IssueComment[];

    private readonly _creationDate: Date;

    private readonly _component: Component;

    private _linkedIssues: string[]

    private _body: string;

    private _title: string;

    private _id: string;

    private _open: boolean;

    private _type: IssueType;

    public constructor(id: string, component: Component, creator: User, creationDate: Date, title: string, body: string, open: boolean, linkedIssues: string[], type: IssueType) {
        this._component = component;
        this._creator = creator;
        this._creationDate = creationDate;
        //this._comments = [];
        this._linkedIssues = linkedIssues;
        this._title = title;
        this._body = body;
        this._id = id;
        this._open = open;
        this._type = type;
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

    /*public get comments(): IssueComment[] {
        return this._comments;
    }*/

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

    public get open(): boolean {
        return this.open;
    }

    public get linkedIssueIds(): string[] {
        return this._linkedIssues;
    }

    public get type(): IssueType {
        return this._type;
    }

    public get component(): Component {
        return this._component;
    }

    public async remove(user: User, dbClient: DBClient): Promise<boolean> {
        return (await getIMSAdapter(this._component, dbClient)).removeIssue(user, this);
    }

    public static async create(component: Component, creator: User, title: string, body: string, type: IssueType, dbClient: DBClient): Promise<Issue> {
        return (await getIMSAdapter(component, dbClient)).createIssue(creator, title, body, type);
    }

    public static async load(id: string, component: Component, user: User, dbClient: DBClient): Promise<Issue> {
        return (await getIMSAdapter(component, dbClient)).getIssue(user, id);
    }
}