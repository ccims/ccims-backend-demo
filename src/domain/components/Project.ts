import { Component } from "./Component";
import { Client } from "pg";
import { DatabaseElement } from "../DatabaseElement";
import { DBClient } from "../DBClient";
import { ExecFileSyncOptionsWithStringEncoding } from "child_process";
import { User } from "../users/User";

export class Project extends DatabaseElement {

    private _name: string;

    private _description: string;

    private componentIDs: Set<BigInt>;

    private ownerID: BigInt;

    private constructor(client: DBClient, id: BigInt, name: string, description: string, components: Set<BigInt>, ownerID: BigInt) {
        super(client, id);
        this._name = name;
        this._description = description;
        this.componentIDs = new Set(components);
        this.ownerID = ownerID;
    }

    public static async create(client: DBClient, name: string, description: string, owner: User): Promise<Project> {
        const pg = client.client;
        return pg.query("INSERT INTO projects (name, description, components, owner) VALUES ($1, $2, $3, $4) RETURNING id;",
            [name, description, [], owner.id]).then(async res => {
                const id: BigInt = res.rows[0]["id"];
                return await Project.load(client, id);
            });
    }

    public static async load(client: DBClient, id: BigInt): Promise<Project> {
        const pg = client.client
        return pg.query("SELECT name, description, components, owner FROM projects WHERE id=$1::bigint;", [id]).then(res => {
            if (res.rowCount !== 1) {
                throw new Error("illegal number of components found");
            } else {
                return new Project(client, id, res.rows[0]["name"], res.rows[0]["description"], new Set(res.rows[0]["components"]), res.rows[0]["owner"]);
            }
        })
    }

    protected async save(): Promise<void> {
        console.log(Array.from(this.componentIDs));
        await this.client.query("UPDATE projects SET name = $1, description = $2, owner = $3, components = $4 WHERE id = $5",
            [this._name, this._description, this.ownerID, Array.from(this.componentIDs), this.id]);
    }

    public get name(): string {
        return this._name;
    }

    public set name(name: string) {
        this._name = name;
        this.invalidate();
    }

    public get description(): string {
        return this._description;
    }

    public set description(description: string) {
        this._description = description;
        this.invalidate();
    }

    public get ownerUserId(): BigInt {
        return this.ownerID;
    }

    public set ownerUserId(id: BigInt) {
        this.ownerID = id;
    }

    public addComponent(component: Component): void {
        this.componentIDs.add(component.id);
        component._addProject(this);
        this.invalidate();
    }

    public removeComponent(component: Component): void {
        this.componentIDs.delete(component.id);
        component._removeProject(this);
        this.invalidate();
    }

    public async getComponents(): Promise<Set<Component>> {
        return new Set(await Promise.all(Array.from(this.componentIDs).map(id => this.imsClient.getComponent(id))));
    }
}