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
    private readonly _sourceComponent: BigInt;
    public async getSourceIssue(user: User, dbClient: DBClient): Promise<Issue> {
        return Issue.load(this._sourceIssue, await Component.load(dbClient, this._sourceComponent), user, dbClient);
    }
    public get srcIssueId(): string {
        return this._sourceIssue;
    }
    public get srcComponentId(): BigInt {
        return this._sourceComponent;
    }


    private readonly _destIssue: string;
    private readonly _destComponent: BigInt;
    public async getDestIssue(user: User, dbClient: DBClient): Promise<Issue> {
        return Issue.load(this._destIssue, await Component.load(dbClient, this._destComponent), user, dbClient);
    }
    public get destIssueId(): string {
        return this._destIssue;
    }
    public get dstComponentId(): BigInt {
        return this._destComponent;
    }

    constructor(type: IssueRelationType, sourceId: string, sourceComponentId: BigInt, destId: string, dstComponentId: BigInt) {
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