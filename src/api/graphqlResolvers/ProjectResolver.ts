import { Project } from "../../domain/components/Project";
import { ComponentResolver } from "./ComponentResolver";
import { DBClient } from "../../domain/DBClient";
import { User } from "../../domain/users/User";

export class ProjectResolver {

    private readonly project: Project;
    private readonly dbClient: DBClient;
    private readonly user: User;

    public constructor(project: Project, user: User, dbClient: DBClient) {
        this.project = project;
        this.dbClient = dbClient;
        this.user = user;
    }

    public id(): string {
        return this.project.id.toString();
    }

    public name(): string {
        return this.project.name
    }

    public async components(): Promise<Array<ComponentResolver>> {
        return Array.from(await this.project.getComponents()).map(component => new ComponentResolver(component, this.user, this.dbClient))
    }

    public async ownerUsername(): Promise<string> {
        const user = await this.dbClient.getUser(this.project.ownerUserId);
        return user.userName;
    }

    public description(): string {
        return this.project.description;
    }
}