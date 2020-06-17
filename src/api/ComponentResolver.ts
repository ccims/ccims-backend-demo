import { Component } from "../domain/components/Component";
import { IssueResolver } from "./IssueResolver";
import { ProjectResolver } from "./ProjectResolver";
import { DBClient } from "../domain/DBClient";

export class ComponentResolver {

    private readonly component: Component;
    private readonly dbClient: DBClient;

    public constructor(component: Component, dbClient: DBClient) {
        this.component = component;
        this.dbClient = dbClient;
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