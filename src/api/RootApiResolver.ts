import { IssueResolver } from "./IssueResolver";
import { UserResolver } from "./UserResolver";
import { User } from "../domain/users/User";
import { DBClient } from "../domain/DBClient";
import { GithubAdapter } from "../adapter/github/GithubAdapter";
import { ProjectResolver } from "./ProjectResolver";
import { Project } from "../domain/components/Project";

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

    public async user(getUserArgs: GetUserArgs): Promise<UserResolver | null> {
        if (getUserArgs.username) {
            const user = await this.dbClient.getUserByUsername(getUserArgs.username);
            if (user) {
                return new UserResolver(user, this.dbClient);
            }
        }
        return null;
    }

    issues(): Array<IssueResolver | null> {
        //return new IssueResolver(new GithubAdapter("", {}), this.dbClient);
        return [null];
    }

    projects(): Array<ProjectResolver | null> {
        return [null];
    }
}

interface DataArgs {
    a: number,
    b?: string
}

interface GetUserArgs {
    username: string
}