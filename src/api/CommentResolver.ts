import { IssueComment } from "../domain/issues/IssueComment";
import { UserResolver } from "./UserResolver";

export class CommentResolver {

    private readonly comment: IssueComment;

    public constructor(comment: IssueComment) {
        this.comment = comment;
    }

    public author(): UserResolver {
        return new UserResolver(this.comment.creator);
    }

    public text(): string {

    }

    public textRendered(): string {

    }
}