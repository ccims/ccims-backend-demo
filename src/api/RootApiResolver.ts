import { IssueResolver } from "./IssueResolver";
import { UserResolver } from "./UserResolver";
import { User } from "../domain/users/User";
import { DBClient } from "../domain/DBClient";
import { GithubAdapter } from "../adapter/github/GithubAdapter";

export class RootApiResolver {

    private readonly dbClient: DBClient;

    constructor(dbClient: DBClient) {
        this.dbClient = dbClient;
    }

    hello(): string {
        return "world";
    }

    data(dataArgs: DataArgs): Array<string> {
        return [dataArgs.a ? "a:" + dataArgs.a : "", dataArgs.b ? "b:" + dataArgs.b : ""];
    }

    public user(getUserArgs: GetUserArgs): UserResolver | null {
        if (getUserArgs.username) {
            const user = User.byUserName(getUserArgs.username);
            if (user) {
                return new UserResolver(user, this.dbClient);
            }
        }
        return null;
    }

    issues(): Array<IssueResolver> {
        return new IssueResolver(new GithubAdapter("", {}), this.dbClient);
    }
}

interface DataArgs {
    a: number,
    b?: string
}

interface GetUserArgs {
    username: string
}