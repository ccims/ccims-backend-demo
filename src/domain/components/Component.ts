import { IMSAdapter } from "../../adapter/IMSAdapter";
import {Project} from "./Project";
import { DBClient } from "../DBClient";
import { DatabaseElement } from "../DatabaseElement";
import { IMSData } from "../../adapter/IMSData";
import { IMSInfo } from "../../adapter/IMSInfo";
import { User } from "../users/User";

export class Component extends DatabaseElement {
    private _name : string;

    private _description: string;

    private readonly projectID: BigInt;

    private imsID: BigInt;

    private ownerID: BigInt;

    private _imsData: IMSData;

    public constructor(client : DBClient, id: BigInt, name : string, description: string, projectID : BigInt, imsID: BigInt, ownerID: BigInt, imsData: IMSData) {
        super(client, id);
        this._name = name;
        this._description = description;
        this.projectID = projectID;
        this.imsID = imsID;
        this.ownerID = ownerID;
        this._imsData = imsData;
    }

    public static async create(client: DBClient, name: string, description: string, project: Project, ims: IMSInfo, owner: User, imsData: IMSData) : Promise<Component> {
        const pg = client.client;
        return pg.query("INSERT INTO components (name, description, owner, project, ims, ims_data) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id;", 
            [name, description, owner.id, project.id, ims.id, imsData]).then(async res => {
                const id : BigInt = res.rows[0]["id"];
                return await Component.load(client, id);
            });
    }

    public static async load(client: DBClient, id: BigInt): Promise<Component> {
        const pg = client.client
        return pg.query("SELECT id, name, description, owner, project, ims, ims_data FROM components WHERE id=$1::bigint;", [id]).then(res => {
            if (res.rowCount !== 1) {
                throw new Error("illegal number of components found");
            } else {
                return new Component(client, id, res.rows[0]["name"], res.rows[0]["description"], 
                    res.rows[0]["project"], res.rows[0]["ims"], res.rows[0]["owner"], res.rows[0]["ims_data"]);
            }
        })
    }

    public get name() : string {
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

    public async getProject(): Promise<Project> {
        return this.imsClient.getProject(this.projectID);
    }
}