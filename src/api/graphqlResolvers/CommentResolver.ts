import { IssueComment } from "../../domain/issues/IssueComment";
import { UserResolver } from "./UserResolver";
import marked from "marked";
import { DBClient } from "../../domain/DBClient";

export class CommentResolver {

    private readonly comment: IssueComment;
    private readonly dbClient: DBClient;

    public constructor(comment: IssueComment, dbClient: DBClient) {
        this.comment = comment;
        this.dbClient = dbClient;
    }

    public author(): UserResolver {
        return new UserResolver(this.comment.creator, this.dbClient);
    }

    public text(): string {
        return this.comment.body;
    }

    public textRendered(): string {
        return marked(this.comment.body);
    }
}