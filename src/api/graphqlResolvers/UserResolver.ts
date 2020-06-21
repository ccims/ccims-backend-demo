import { User } from "../../domain/users/User";
import { ComponentResolver } from "./ComponentResolver";
import { ProjectResolver } from "./ProjectResolver";
import { DBClient } from "../../domain/DBClient";

export class UserResolver {

    private readonly user: User;
    private readonly dbClient: DBClient;

    public constructor(user: User, dbClient: DBClient) {
        this.user = user;
        this.dbClient = dbClient;
    }

    public name(): string {
        return this.user.userName;
    }

    public components(): Array<ComponentResolver | null> {
        return [null];
    }

    public projects(): Array<ProjectResolver | null> {
        return [null];
    }
}