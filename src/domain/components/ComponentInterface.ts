import { DatabaseElement } from "../DatabaseElement";
import { DBClient } from "../DBClient";
import { Component } from "./Component";

export class ComponentInterface extends DatabaseElement {
    private _name: string;

    private _hostComponentId: string;

    private _usingComponentsIds: Set<string>;



    public constructor(client: DBClient, id: string, name: string, hostComponentID: string, usingComponentsIDs: Set<string>) {
        super(client, id);
        this._name = name;
        this._hostComponentId = hostComponentID;
        this._usingComponentsIds = usingComponentsIDs;
    }

    public static async _create(client: DBClient, name: string, hostComponent: Component): Promise<ComponentInterface> {
        const pg = client.client;
        return pg.query("INSERT INTO interfaces (name, host_component, using_components) VALUES ($1, $2, $3) RETURNING id;",
            [name, hostComponent.id, []]).then(async res => {
                const id: string = res.rows[0]["id"];
                const newComponentInterface = await ComponentInterface._load(client, id);
                hostComponent._addComponentInterface(newComponentInterface);
                return newComponentInterface;
            });
    }

    public static async _load(client: DBClient, id: string): Promise<ComponentInterface> {
        const pg = client.client
        return pg.query("SELECT name, host_component, using_components FROM interfaces WHERE id=$1;", [id]).then(res => {
            if (res.rowCount !== 1) {
                throw new Error("illegal number of component interfaces found");
            } else {
                return new ComponentInterface(client, id, res.rows[0]["name"], res.rows[0]["host_component"], new Set(res.rows[0]["using_components"]));
            }
        })
    }

    protected async save(): Promise<void> {
        this.client.query("UPDATE interfaces SET name = $1, host_component = $2, using_components = $3 WHERE id = $4",
            [this._name, this._hostComponentId, Array.from(this._usingComponentsIds), this.id]);
    }

    public get name(): string {
        return this._name;
    }

    public set name(name: string) {
        this._name = name;
        this.invalidate();
    }

    public get hostComponentId(): string {
        return this._hostComponentId;
    }

    public get usingComponentIds(): Set<string> {
        return this._usingComponentsIds;
    }

    public async getHostComponent(): Promise<Component> {
        return this.imsClient.getComponent(this._hostComponentId);
    }

    public _addUsingComponent(component: Component): void {
        this._usingComponentsIds.add(component.id);
        this.invalidate();
    }

    public _removeUsingComponent(component: Component): void {
        this._usingComponentsIds.delete(component.id);
        this.invalidate();
    }

    public async getUsingComponents(): Promise<Set<Component>> {
        return new Set(await Promise.all(Array.from(this._usingComponentsIds).map(id => this.imsClient.getComponent(id))));
    }
}