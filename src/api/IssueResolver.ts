import { Issue } from "../domain/issues/Issue";
import { CommentResolver } from "./CommentResolver";

export class IssueResolver {

    private readonly issue: Issue;

    public constructor(issue: Issue) {
        this.issue = issue;
    }

    public title(): string {

    }

    public body(): string {

    }

    public bodyRendered(): string {

    }

    public comments(): Array<CommentResolver> {
        return this.issue.comments.map(comment => new CommentResolver(comment));
    }
}