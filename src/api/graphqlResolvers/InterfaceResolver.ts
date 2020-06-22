import { ComponentInterface } from "../../domain/components/ComponentInterface";
import { DBClient } from "../../domain/DBClient";
import { ComponentResolver } from "./ComponentResolver";
import { Component } from "../../domain/components/Component";

export class InterfaceResolver {

    private readonly componentInterface: ComponentInterface;
    private readonly dbClient: DBClient;

    constructor(componentInterface: ComponentInterface, dbClient: DBClient) {
        this.componentInterface = componentInterface;
        this.dbClient = dbClient;
    }

    public id(): string {
        return this.componentInterface.id.toString();
    }

    public async hostComponent(): Promise<ComponentResolver> {
        return new ComponentResolver(await this.componentInterface.getHostComponent(), this.dbClient);
    }

    public async usingComponents(): Promise<ComponentResolver[]> {
        return Array.from((await this.componentInterface.getUsingComponents())).map((component): ComponentResolver => new ComponentResolver(component, this.dbClient));
    }
}