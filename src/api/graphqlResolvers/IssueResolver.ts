import { Issue } from "../../domain/issues/Issue";
import { CommentResolver } from "./CommentResolver";
import marked from "marked";
import { DBClient } from "../../domain/DBClient";
import { IssueRelationResolver } from "./IssueRelationResolver";
import { IssueType } from "../../domain/issues/IssueType";
import { User } from "../../domain/users/User";
import { InterfaceResolver } from "./InterfaceResolver";

export class IssueResolver {

    private readonly issue: Issue;
    private readonly dbClient: DBClient;
    private readonly user: User

    public constructor(issue: Issue, user: User, dbClient: DBClient) {
        this.issue = issue;
        this.dbClient = dbClient;
        this.user = user;
    }

    public id(): string {
        return this.issue.id;
    }

    public title(): string {
        return this.issue.title;
    }

    public body(): string {
        return this.issue.body;
    }

    public bodyRendered(): string {
        return marked(this.issue.body);
    }

    /*public comments(): Array<CommentResolver> {
        return this.issue.comments.map(comment => new CommentResolver(comment, this.dbClient));
    }*/

    public creationDate(): string {
        return this.issue.creationDate.toString();
    }

    public opened(): boolean {
        return this.issue.open;
    }

    public issueType(): IssueType {
        return this.issue.type;
    }

    public relatedIssues(): Array<IssueRelationResolver> {
        return this.issue.issueRelations.map(relation => new IssueRelationResolver(relation, this.user, this.dbClient));
    }

    public async interfaces(): Promise<Array<InterfaceResolver>> {
        return (await this.issue.getComponentInterfaces(this.dbClient)).map(iface => new InterfaceResolver(iface, this.user, this.dbClient));
    }
}