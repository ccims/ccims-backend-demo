import { IMSAdapter } from "../../adapter/IMSAdapter";
import { Project } from "./Project";
import { DBClient } from "../DBClient";
import { DatabaseElement } from "../DatabaseElement";
import { IMSData } from "../../adapter/IMSData";
import { IMSInfo } from "../../adapter/IMSInfo";
import { User } from "../users/User";
import { compileFunction } from "vm";
import { ComponentInterface } from "./ComponentInterface";

export class Component extends DatabaseElement {
    private _name: string;

    private _description: string;

    private projectIDs: Set<string>;

    private imsID: string;

    private ownerID: string;

    private _imsData: IMSData;

    private interfaceIDs: Set<string>

    private consumedInterfaceIDs: Set<string>

    private constructor(client: DBClient, id: string, name: string, description: string, projectIDs: Set<string>, imsID: string,
         ownerID: string, imsData: IMSData, interfaceIDs: Set<string>, consumedInterfaceIDs: Set<string>) {
        super(client, id);
        this._name = name;
        this._description = description;
        this.projectIDs = projectIDs;
        this.imsID = imsID;
        this.ownerID = ownerID;
        this._imsData = imsData;
        this.interfaceIDs = interfaceIDs;
        this.consumedInterfaceIDs = consumedInterfaceIDs;
    }

    public static async _create(client: DBClient, name: string, description: string, projects: Set<Project>, ims: IMSInfo, owner: User, imsData: IMSData): Promise<Component> {
        const pg = client.client;
        return pg.query("INSERT INTO components (name, description, owner, projects, ims, ims_data, interfaces, consumed_interfaces) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id;",
            [name, description, owner.id, Array.from(projects).map(project => project.id), ims.id, imsData, [], []]).then(async res => {
                const id: string = res.rows[0]["id"];
                const newComponent = await Component._load(client, id);
                projects.forEach(project => project.addComponent(newComponent));
                owner.addComponent(newComponent);
                return newComponent;
            });
    }

    public static async _load(client: DBClient, id: string): Promise<Component> {
        const pg = client.client
        return pg.query("SELECT id, name, description, owner, projects, ims, ims_data, interfaces, consumed_interfaces FROM components WHERE id=$1;", [id]).then(res => {
            if (res.rowCount !== 1) {
                throw new Error("illegal number of components found");
            } else {
                return new Component(client, id, res.rows[0]["name"], res.rows[0]["description"],
                    new Set(res.rows[0]["projects"]), res.rows[0]["ims"], res.rows[0]["owner"], res.rows[0]["ims_data"],
                    new Set(res.rows[0]["interfaces"]), new Set(res.rows[0]["consumed_interfaces"]));
            }
        })
    }

    protected async save(): Promise<void> {
        this.client.query("UPDATE components SET name = $1, description = $2, owner = $3, ims = $4, ims_data = $5, projects = $6, interfaces = $7, consumed_interfaces = $8 WHERE id = $9",
            [this._name, this._description, this.ownerID, this.imsID, this.imsData, Array.from(this.projectIDs), Array.from(this.interfaceIDs), Array.from(this.consumedInterfaceIDs), this.id]);
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

    public async getIMSInfo(): Promise<IMSInfo> {
        return this.imsClient.getIMSInfo(this.imsID);
    }

    public async getOwner(): Promise<User> {
        return this.imsClient.getUser(this.ownerID);
    }

    public setOwner(owner: User): void {
        this.ownerID = owner.id;
        this.invalidate();
    }

    public get imsData(): IMSData {
        return this._imsData
    }

    public set imsData(imsData: IMSData) {
        this._imsData = imsData;
        this.invalidate();
    }

    public _addProject(project: Project): void {
        this.projectIDs.add(project.id);
        this.invalidate();
    }

    public _removeProject(project: Project): void {
        this.projectIDs.delete(project.id);
        this.invalidate();
    }

    public _addComponentInterface(componentInterface: ComponentInterface): void {
        this.interfaceIDs.add(componentInterface.id);
        this.invalidate();
    }

    public _removeComponentInterface(componentInterface: ComponentInterface): void {
        this.interfaceIDs.delete(componentInterface.id);
        this.invalidate();
    }

    public addConsumedComponentInterface(componentInterface: ComponentInterface): void {
        this.consumedInterfaceIDs.add(componentInterface.id);
        componentInterface._addUsingComponent(this);
        this.invalidate();
    }

    public removeConsumedComponentInterface(componentInterface: ComponentInterface): void {
        this.consumedInterfaceIDs.delete(componentInterface.id);
        componentInterface._removeUsingComponent(this);
        this.invalidate();
    }

    public async getProjects(): Promise<Set<Project>> {
        return new Set(await Promise.all(Array.from(this.projectIDs).map(id => this.imsClient.getProject(id))));
    }

    public async getComponentInterfaces(): Promise<Set<ComponentInterface>> {
        return new Set(await Promise.all(Array.from(this.interfaceIDs).map(id => this.imsClient.getComponentInterface(id))))
    }

    public async getConsumedComponentInterfaces(): Promise<Set<ComponentInterface>> {
        return new Set(await Promise.all(Array.from(this.consumedInterfaceIDs).map(id => this.imsClient.getComponentInterface(id))));
    }
}