import {User} from "../users/User";
import {Component} from "../components/Component";
import { IssueComment } from "./IssueComment";
import { Client } from "pg";
import { DatabaseElement } from "../DatabaseElement";

export class Issue extends DatabaseElement  {

    private readonly _creator : User;

    private _comments : IssueComment[]

    private readonly _creationDate : Date;

    private readonly _component : Component;

    private _linkedIssues : string[]

    private _body : string;

    private _title : string;

    public constructor (client : Client, id : string) {
        super(client, id);
        this._component = component;
        this._creator = creator;
        this._creationDate = creationDate;
        this._comments = [];
        this._linkedIssues = [];
        this._body = body;
        this._title = title;
    }

    private refreshLinkedIssues() {
        this._linkedIssues = []
        //this._comments.forEach(comment => )
    }

    public createComment(asUser : User, body : string) : IssueComment {
        return new IssueComment(asUser, body);
    }

    /**
     * add an alredy existing IssueComment to this Issue
     * @param comment 
     */
    public addComment(comment : IssueComment) : void {
        this.refreshLinkedIssues();
    }

    public get creator() : User {
        return this._creator;
    }

    public get comments() : IssueComment[] {
        return this._comments;
    }

    public get creationDate() : Date {
        return this._creationDate;
    }
}