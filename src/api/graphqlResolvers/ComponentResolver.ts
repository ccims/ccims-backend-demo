import { Component } from "../../domain/components/Component";
import { IssueResolver } from "./IssueResolver";
import { ProjectResolver } from "./ProjectResolver";
import { DBClient } from "../../domain/DBClient";
import { InterfaceResolver } from "./InterfaceResolver";
import { IMSResolver } from "./IMSResolver";
import { IMSData } from "../../adapter/IMSData";
import { getIMSAdapter } from "../../adapter/IMSAdapterFactory";
import { User } from "../../domain/users/User";

export class ComponentResolver {

    private readonly component: Component;
    private readonly dbClient: DBClient;
    private readonly user: User;

    public constructor(component: Component, user: User, dbClient: DBClient) {
        this.component = component;
        this.dbClient = dbClient;
        this.user = user;
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
        return IMSResolver.getIMSResolver(await this.component.getIMSInfo(), this.dbClient);
    }

    public async interfaces(): Promise<Array<InterfaceResolver | null>> {
        return Array.from(await this.component.getComponentInterfaces()).map(compIface => new InterfaceResolver(compIface, this.user, this.dbClient))
    }

    public async usedInterfaces(): Promise<Array<InterfaceResolver>> {
        return Array.from(await this.component.getConsumedComponentInterfaces()).map(compIface => new InterfaceResolver(compIface, this.user, this.dbClient));
    }

    public async issues(): Promise<Array<IssueResolver>> {
        return (await (await getIMSAdapter(this.component, this.dbClient)).getAllIssues(this.user)).map(issue => new IssueResolver(issue, this.user, this.dbClient));
    }

    public async projects(): Promise<Array<ProjectResolver | null>> {
        return Array.from(await this.component.getProjects()).map(project => new ProjectResolver(project, this.user, this.dbClient));
    }
}