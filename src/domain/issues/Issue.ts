import { User } from "../users/User";
import { Component } from "../components/Component";
import { IssueComment } from "./IssueComment";
import { Client } from "pg";
import { DatabaseElement } from "../DatabaseElement";
import { DBClient } from "../DBClient";
import { GitHubAdapter } from "../../adapter/github/GitHubAdapter";
import { getIMSAdapter } from "../../adapter/IMSAdapterFactory";
import { IssueType } from "./IssueType";
import { IssueRelation, IssueRelationType } from "./IssueRelation";

export class Issue {

    private readonly _creator: User;

    //private _comments: IssueComment[];

    private readonly _creationDate: Date;

    private readonly _component: Component;

    private _linkedIssues: IssueRelation[]

    private _body: string;

    private _title: string;

    private _id: string;

    private _open: boolean;

    private _type: IssueType;

    private _fieldsToSave: SavableFields;

    public constructor(id: string, component: Component, creator: User, creationDate: Date, title: string, body: string, open: boolean, linkedIssues: IssueRelation[], type: IssueType) {
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
        this._fieldsToSave = new SavableFields();
    }

    /*public createComment(asUser: User, body: string, creationDate: Date): IssueComment {
        return new IssueComment(asUser, body, creationDate);
    }*/

    /**
     * add an alredy existing IssueComment to this Issue
     * @param comment 
     */
    /*public addComment(comment: IssueComment): void {
        this.refreshLinkedIssues();
    }*/

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

    public set title(title: string) {
        this._title = title;
        this._fieldsToSave.title = true;
    }

    public get body(): string {
        return this._title;
    }

    public set body(body: string) {
        this._body = body;
        this._fieldsToSave.body = true;
    }

    public get id(): string {
        return this._id;
    }

    public get open(): boolean {
        return this._open;
    }

    public set open(openState: boolean) {
        if (openState != this._open) {
            this._fieldsToSave.openState = true;
        }
        this._open = openState;
    }

    public get issueRelations(): IssueRelation[] {
        return this._linkedIssues;
    }

    public get type(): IssueType {
        return this._type;
    }

    public set type(type: IssueType) {
        this._type = type;
        this._fieldsToSave.type = true;
    }

    public get component(): Component {
        return this._component;
    }

    public get fieldsToSave(): SavableFields {
        return this._fieldsToSave;
    }

    public async addIssueRelation(type: IssueRelationType, sourceId: string, sourceComponentId: BigInt, destId: string, dstComponentId: BigInt, dbClient: DBClient): Promise<IssueRelation> {
        let issueRelation: IssueRelation | undefined = this.issueRelations.find(relation => relation.srcIssueId == sourceId && relation.destIssueId == destId && relation.srcComponentId == BigInt(sourceComponentId) && relation.dstComponentId == BigInt(dstComponentId));
        if (!issueRelation) {
            issueRelation = new IssueRelation(type, sourceId, sourceComponentId, destId, dstComponentId);
            this._linkedIssues.push(issueRelation);
        }
        this._fieldsToSave.issueRelations = true;
        return issueRelation;
    }

    public async removeIssueRelation(sourceId: string, sourceComponentId: BigInt, destId: string): Promise<boolean> {
        const removedRelations = this.issueRelations.filter(relation => !(relation.srcIssueId == sourceId && relation.destIssueId == destId && relation.srcComponentId == BigInt(sourceComponentId)));
        let removedAny = false;
        if (removedRelations.length < this.issueRelations.length) {
            removedAny = true;
        }
        this._linkedIssues = removedRelations;
        this._fieldsToSave.issueRelations = true;
        return removedAny;
    }

    public async saveToIMS(user: User, dbClient: DBClient) {
        if (this._fieldsToSave.needsSave) {
            const imsAdapter = (await getIMSAdapter(this._component, dbClient))
            await imsAdapter.updateIssue(user, this);
            if (this._fieldsToSave.openState) {
                if (this._open) {
                    await imsAdapter.reopenIssue(user, this);
                } else {
                    await imsAdapter.closeIssue(user, this);
                }
            }
            this._fieldsToSave.saved();
        }
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

class SavableFields {
    title: boolean = false;
    body: boolean = false;
    type: boolean = false;
    openState: boolean = false;
    issueRelations: boolean = false;

    public get needsSave(): boolean {
        return this.title || this.body || this.type || this.openState || this.issueRelations;
    }

    public saved(): void {
        this.title = false;
        this.body = false;
        this.openState = false;
        this.type = false;
        this.issueRelations = false;
    }
}