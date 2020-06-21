import { Component } from "../../domain/components/Component";
import { IssueResolver } from "./IssueResolver";
import { ProjectResolver } from "./ProjectResolver";
import { DBClient } from "../../domain/DBClient";
import { InterfaceResolver } from "./InterfaceResolver";
import { IMSResolver } from "./IMSResolver";

export class ComponentResolver {

    private readonly component: Component;
    private readonly dbClient: DBClient;

    public constructor(component: Component, dbClient: DBClient) {
        this.component = component;
        this.dbClient = dbClient;
    }

    public id(): string {
        return this.component.id.toString();
    }

    public name(): string {
        return this.component.name;
    }

    public description(): string {
        return this.component.description;
    }

    public ims(): IMSResolver | null {
        //TODO: Implement
        return null;
    }

    public interfaces(): Array<InterfaceResolver | null> {
        //TODO: Implement
        return [null];
    }

    public usedInterfaces(): Array<InterfaceResolver | null> {
        //TODO: Implement
        return [null];
    }

    public issues(): Array<IssueResolver | null> {
        return [null];
    }

    public projects(): Array<ProjectResolver | null> {
        return [null];
    }
}