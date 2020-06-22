import { IssueRelation, IssueRelationType } from "../../domain/issues/IssueRelation";
import { DBClient } from "../../domain/DBClient";
import { IssueResolver } from "./IssueResolver";
import { User } from "../../domain/users/User";

export class IssueRelationResolver {

    private readonly relation: IssueRelation;
    private readonly dbClient: DBClient;
    private readonly user: User;

    constructor(relation: IssueRelation, user: User, dbClient: DBClient) {
        this.relation = relation;
        this.dbClient = dbClient;
        this.user = user;
    }

    public async sourceIssue(): Promise<IssueResolver> {
        return new IssueResolver(await this.relation.getSourceIssue(this.user, this.dbClient), this.user, this.dbClient);
    }

    public async destIssue(): Promise<IssueResolver> {
        return new IssueResolver(await this.relation.getDestIssue(this.user, this.dbClient), this.user, this.dbClient);
    }

    public relationType(): IssueRelationType {
        return this.relation.relationType;
    }

}