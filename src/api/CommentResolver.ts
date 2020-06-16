import { IssueComment } from "../domain/issues/IssueComment";
import { UserResolver } from "./UserResolver";
import marked from "marked";

export class CommentResolver {

    private readonly comment: IssueComment;

    public constructor(comment: IssueComment) {
        this.comment = comment;
    }

    public author(): UserResolver {
        return new UserResolver(this.comment.creator);
    }

    public text(): string {
        return this.comment.body;
    }

    public textRendered(): string {
        return marked(this.comment.body);
    }
}