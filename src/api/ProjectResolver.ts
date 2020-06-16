import { Project } from "../domain/components/Project";
import { ComponentResolver } from "./ComponentResolver";

export class ProjectResolver {

    private project: Project;

    public constructor(project: Project) {
        this.project = project;
    }

    public name(): string {

    }

    public components(): Array<ComponentResolver> {

    }
}