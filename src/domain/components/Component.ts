import { IMSAdapter } from "../../adapter/IMSAdapter";
import {Project} from "./Project";
import { DBClient } from "../DBClient";
import { DatabaseElement } from "../DatabaseElement";

export class Component extends DatabaseElement {
    private readonly _name : string;

    private readonly projectID: BigInt;

    private imsID: BigInt;

    private readonly ownerID: BigInt;

    private imsData: object;

    public constructor(client : DBClient, id: BigInt, name : string, description: string, projectID : BigInt, imsID: BigInt, ownerID: BigInt, imsData: object) {
        super(client, id);
        this._name = name;
        this.projectID = projectID;
        this.imsID = imsID;
        this.ownerID = ownerID;
    }

    public static async load(client: DBClient, id: BigInt): Component {
        const pg = client.client
        return pg.query("SELECT id, username, password, components, ims_login FROM users WHERE id=$1::bigint;", [id]).then(res => {
            if (res.rowCount !== 1) {
                throw new Error("illegal number of users found");
            } else {
                return new User(client, id, res.rows[0]["username"], res.rows[0]["password"] as string, res.rows[0]["components"], []);
            }
        })
    }

    public get name() : string {
        return this._name;
    }
}