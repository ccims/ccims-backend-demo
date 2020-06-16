import { Issue } from "../domain/issues/Issue";
import { CommentResolver } from "./CommentResolver";
import marked from "marked";

export class IssueResolver {

    private readonly issue: Issue;

    public constructor(issue: Issue) {
        this.issue = issue;
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
        return this.issue.comments.map(comment => new CommentResolver(comment));
    }
}