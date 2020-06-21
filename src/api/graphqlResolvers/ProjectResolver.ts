import { Project } from "../../domain/components/Project";
import { ComponentResolver } from "./ComponentResolver";
import { DBClient } from "../../domain/DBClient";

export class ProjectResolver {

    private readonly project: Project;
    private readonly dbClient: DBClient;

    public constructor(project: Project, dbClient: DBClient) {
        this.project = project;
        this.dbClient = dbClient;
    }

    public name(): string {
        return this.project.name
    }

    public components(): Array<ComponentResolver | null> {
        return [null];
    }
}