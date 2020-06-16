import { Project } from "../domain/components/Project";
import { ComponentResolver } from "./ComponentResolver";

export class ProjectResolver {

    private project: Project;

    public constructor(project: Project) {
        this.project = project;
    }

    public name(): string {
        return this.project.name
    }

    public components(): Array<ComponentResolver | null> {
        return [null];
    }
}