import { Component } from "../../domain/components/Component";
import { IssueResolver } from "./IssueResolver";
import { ProjectResolver } from "./ProjectResolver";
import { DBClient } from "../../domain/DBClient";
import { InterfaceResolver } from "./InterfaceResolver";
import { IMSResolver } from "./IMSResolver";
import { IMSData } from "../../adapter/IMSData";

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

    public imsData(): IMSData {
        return this.component.imsData;
    }

    public async ims(): Promise<IMSResolver> {
        return new IMSResolver(await this.component.getIMSInfo(), this.dbClient);
    }

    public async interfaces(): Promise<Array<InterfaceResolver | null>> {
        return Array.from(await this.component.getComponentInterfaces()).map(compIface => new InterfaceResolver(compIface, this.dbClient))
    }

    public async usedInterfaces(): Promise<Array<InterfaceResolver>> {
        return Array.from(await this.component.getConsumedComponentInterfaces()).map(compIface => new InterfaceResolver(compIface, this.dbClient));
    }

    public issues(): Array<IssueResolver | null> {
        return [null];
    }

    public async projects(): Promise<Array<ProjectResolver | null>> {
        return Array.from(await this.component.getProjects()).map(project => new ProjectResolver(project, this.dbClient));
    }
}