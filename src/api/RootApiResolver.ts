import { IssueResolver } from "./IssueResolver";
import { Issue } from "../domain/issues/Issue";
import { UserResolver } from "./UserResolver";
import { User } from "../domain/users/User";

export class RootApiResolver {

    hello(): string {
        return "world";
    }

    data(dataArgs: DataArgs): Array<string> {
        return [dataArgs.a ? "a:" + dataArgs.a : "", dataArgs.b ? "b:" + dataArgs.b : ""];
    }

    public user(getUserArgs: GetUserArgs): UserResolver | undefined {
        if (getUserArgs.username) {
            const user = User.byUserName(getUserArgs.username);
            if (user) {
                return new UserResolver(user);
            }
        }
        return undefined;
    }

    issue(id: string) {
        return new IssueResolver();
    }
}

interface DataArgs {
    a: number,
    b?: string
}

interface GetUserArgs {
    username: string
}