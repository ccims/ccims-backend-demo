import { User } from "../domain/users/User";
import { ComponentResolver } from "./ComponentResolver";
import { ProjectResolver } from "./ProjectResolver";

export class UserResolver {

    private readonly user: User;

    public constructor(user: User) {
        this.user = user;
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