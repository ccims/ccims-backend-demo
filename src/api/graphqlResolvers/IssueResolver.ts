import { Issue } from "../../domain/issues/Issue";
import { CommentResolver } from "./CommentResolver";
import marked from "marked";
import { DBClient } from "../../domain/DBClient";
import { IssueRelationResolver } from "./IssueRelationResolver";

export class IssueResolver {

    private readonly issue: Issue;
    private readonly dbClient: DBClient;

    public constructor(issue: Issue, dbClient: DBClient) {
        this.issue = issue;
        this.dbClient = dbClient;
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

    public comments(): Array<CommentResolver> {
        return this.issue.comments.map(comment => new CommentResolver(comment, this.dbClient));
    }

    public creationDate(): string {
        return this.issue.creationDate.toString();
    }

    public opened(): boolean {
        //TODO: Implement
        return true;
    }

    public issueType(): null {
        //TODO: Implement
        return null;
    }

    public relatedIssues(): Array<IssueRelationResolver | null> {
        //TODO: Implement
        return [null];
    }
}