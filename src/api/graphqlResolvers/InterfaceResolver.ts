import { ComponentInterface } from "../../domain/components/ComponentInterface";
import { DBClient } from "../../domain/DBClient";
import { ComponentResolver } from "./ComponentResolver";
import { Component } from "../../domain/components/Component";
import { User } from "../../domain/users/User";

export class InterfaceResolver {

    private readonly componentInterface: ComponentInterface;
    private readonly dbClient: DBClient;
    private readonly user: User;

    constructor(componentInterface: ComponentInterface, user: User, dbClient: DBClient) {
        this.componentInterface = componentInterface;
        this.dbClient = dbClient;
        this.user = user;
    }

    public id(): string {
        return this.componentInterface.id.toString();
    }

    public name(): string {
        return this.componentInterface.name;
    }

    public async hostComponent(): Promise<ComponentResolver> {
        return new ComponentResolver(await this.componentInterface.getHostComponent(), this.user, this.dbClient);
    }

    public async usingComponents(): Promise<ComponentResolver[]> {
        return Array.from((await this.componentInterface.getUsingComponents())).map((component): ComponentResolver => new ComponentResolver(component, this.user, this.dbClient));
    }
}