import { Component } from "../domain/components/Component";
import { IssueResolver } from "./IssueResolver";
import { ProjectResolver } from "./ProjectResolver";

export class ComponentResolver {

    private component: Component;

    public constructor(component: Component) {
        this.component = component;
    }

    public name(): string {
        return this.component.name;
    }

    public issues(): Array<IssueResolver | null> {
        return [null];
    }

    public projects(): Array<ProjectResolver | null> {
        return [null];
    }
}