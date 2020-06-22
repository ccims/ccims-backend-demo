import { Issue } from "./Issue";
import { Component } from "../components/Component";
import { DBClient } from "../DBClient";
import { User } from "../users/User";

export class IssueRelation {

    private readonly _relationType: IssueRelationType;
    public get relationType(): IssueRelationType {
        return this._relationType;
    }


    private readonly _sourceIssue: string;
    private readonly _sourceComponent: string;
    public async getSourceIssue(user: User, dbClient: DBClient): Promise<Issue> {
        return Issue.load(this._sourceIssue, await dbClient.getComponent(this._sourceComponent), user, dbClient);
    }
    public get srcIssueId(): string {
        return this._sourceIssue;
    }
    public get srcComponentId(): string {
        return this._sourceComponent;
    }


    private readonly _destIssue: string;
    private readonly _destComponent: string;
    public async getDestIssue(user: User, dbClient: DBClient): Promise<Issue> {
        return Issue.load(this._destIssue, await dbClient.getComponent(this._destComponent), user, dbClient);
    }
    public get destIssueId(): string {
        return this._destIssue;
    }
    public get dstComponentId(): string {
        return this._destComponent;
    }

    constructor(type: IssueRelationType, sourceId: string, sourceComponentId: string, destId: string, dstComponentId: string) {
        this._relationType = type;
        this._sourceIssue = sourceId;
        this._destIssue = destId;
        this._sourceComponent = sourceComponentId;
        this._destComponent = dstComponentId;
    }

}

export enum IssueRelationType {
    RELATED_TO = "RELATED_TO",
    DUPLICATES = "DUPLICATES",
    DEPENDS = "DEPENDS",
}