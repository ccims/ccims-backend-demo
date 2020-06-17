import { IMSAdapter } from "../../adapter/IMSAdapter";
import {Project} from "./Project";
import { DBClient } from "../DBClient";
import { DatabaseElement } from "../DatabaseElement";
import { IMSData } from "../../adapter/IMSData";
import { IMSInfo } from "../../adapter/IMSInfo";
import { User } from "../users/User";

export class Component extends DatabaseElement {
    private readonly _name : string;

    private readonly projectID: BigInt;

    private imsID: BigInt;

    private readonly ownerID: BigInt;

    private imsData: IMSData;

    public constructor(client : DBClient, id: BigInt, name : string, description: string, projectID : BigInt, imsID: BigInt, ownerID: BigInt, imsData: IMSData) {
        super(client, id);
        this._name = name;
        this.projectID = projectID;
        this.imsID = imsID;
        this.ownerID = ownerID;
        this.imsData = imsData;
    }

    public static async create(client: DBClient, name: string, description: string, project: Project, ims: IMSInfo, owner: User, imsData: IMSData) : Promise<Component> {
        const pg = client.client;
        return pg.query("INSERT INTO components (name, description, owner, project, ims, ims_data) VALUES ($1, $2, $3, $4) RETURNING id;", 
            [name, description, owner.id, project.id, ims.id]).then(async res => {
                const id : BigInt = res.rows[0]["id"];
                return await Component.load(client, id);
            });
    }

    public static async load(client: DBClient, id: BigInt): Promise<Component> {
        const pg = client.client
        return pg.query("SELECT id, name, description, owner, project, ims, ims_data FROM users WHERE id=$1::bigint;", [id]).then(res => {
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
}