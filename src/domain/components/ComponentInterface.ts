import { DatabaseElement } from "../DatabaseElement";
import { DBClient } from "../DBClient";
import { Component } from "./Component";

export class ComponentInterface extends DatabaseElement {
    private _name: string;

    private hostComponentID: BigInt;

    private usingComponentsIDs: Set<BigInt>;

    

    public constructor(client: DBClient, id: BigInt, name: string, hostComponentID: BigInt, usingComponentsIDs: Set<BigInt>) {
        super(client, id);
        this._name = name;
        this.hostComponentID = hostComponentID;
        this.usingComponentsIDs = usingComponentsIDs;
    }

    public static async create(client: DBClient, name: string, hostComponent: Component): Promise<ComponentInterface> {
        const pg = client.client;
        return pg.query("INSERT INTO interfaces (name, host_component, using_components) VALUES ($1, $2, $3) RETURNING id;",
            [name, hostComponent.id,[]]).then(async res => {
                const id: BigInt = res.rows[0]["id"];
                const newComponentInterface = await ComponentInterface.load(client, id);
                hostComponent._addComponentInterface(newComponentInterface);
                return newComponentInterface;
            });
    }

    public static async load(client: DBClient, id: BigInt): Promise<ComponentInterface> {
        const pg = client.client
        return pg.query("SELECT name, host_component, using_components FROM interfaces WHERE id=$1::bigint;", [id]).then(res => {
            if (res.rowCount !== 1) {
                throw new Error("illegal number of components found");
            } else {
                return new ComponentInterface(client, id, res.rows[0]["name"], res.rows[0]["host_component"], new Set(res.rows[0]["using_components"]));
            }
        })
    }

    protected async save(): Promise<void> {
        this.client.query("UPDATE interfaces SET name = $1, host_component = $2, using_components = $3 WHERE id = $4",
            [this._name, this.hostComponentID, Array.from(this.usingComponentsIDs), this.id]);
    }

    public get name(): string {
        return this._name;
    }

    public set name(name: string) {
        this._name = name;
        this.invalidate();
    }

    public async getHostComponent(): Promise<Component> {
        return this.imsClient.getComponent(this.hostComponentID);
    }

    public _addUsingComponent(component: Component): void {
        this.usingComponentsIDs.add(component.id);
        this.invalidate();
    }

    public _removeUsingComponent(component: Component): void {
        this.usingComponentsIDs.delete(component.id);
        this.invalidate();
    }

    public async getUsingComponents(): Promise<Set<Component>> {
        return new Set(await Promise.all(Array.from(this.usingComponentsIDs).map(id => this.imsClient.getComponent(id))));
    }
}