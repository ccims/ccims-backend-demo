import {User} from "../users/User";
import {Component} from "../components/Component";
import { IssueComment } from "./IssueComment";

export class Issue {

    private readonly _creator : User;

    private _comments : IssueComment[]

    private readonly _creationDate : Date;

    private readonly _component : Component;

    private readonly _id : string;

    private _linkedIssues : string[]

    public constructor (component : Component, id : string, creator : User, creationDate : Date) {
        this._component = component;
        this._id = id;
        this._creator = creator;
        this._creationDate = creationDate;
        this._comments = [];
        this._linkedIssues = [];
    }

    private refreshLinkedIssues() {
        this._linkedIssues = []
        this._comments.forEach(comment => )
    }

    public createComment(asUser : User, body : string) {

        
    }

    /**
     * add an alredy existing IssueComment to this Issue
     * @param comment 
     */
    public addComment(comment : IssueComment) {
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