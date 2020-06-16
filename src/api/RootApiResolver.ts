import { IssueResolver } from "./IssueResolver";
import { UserResolver } from "./UserResolver";
import { User } from "../domain/users/User";

export class RootApiResolver {

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
                return new UserResolver(user);
            }
        }
        return null;
    }

    issue(id: string): IssueResolver | null {
        return null;
    }
}

interface DataArgs {
    a: number,
    b?: string
}

interface GetUserArgs {
    username: string
}