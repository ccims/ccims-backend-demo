import { Component } from "../domain/components/Component";
import { IssueResolver } from "./IssueResolver";
import { ProjectResolver } from "./ProjectResolver";

export class ComponentResolver {

    private component: Component;

    public constructor(component: Component) {
        this.component = component;
    }

    public name(): string {

    }

    public issues(): Array<IssueResolver> {

    }

    public projects(): Array<ProjectResolver> {

    }
}