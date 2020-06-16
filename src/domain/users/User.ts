import { Client } from "pg"
import { DatabaseElement } from "../DatabaseElement";
import { IMSClient } from "../IMSClient";
import { IMSCrendential } from "../../adapter/IMSCredential";

export class User extends DatabaseElement {
    private _userName: string;

    private _password: string;

    private componentIDs : string[];

    private imsCredentials : IMSCrendential[];

    private constructor(client : IMSClient, id : BigInt, userName : string, password : string, components : string[], imsCredentials : IMSCrendential[]) {
        super(client, id);
        this._userName = userName;
        this._password = password;
        this.componentIDs = components;
        this.imsCredentials = imsCredentials;
    }

    public static async load(client : IMSClient, id : BigInt) : Promise<User> {
        const pg = client.client
        return pg.query("SELECT id, username, password, components, ims_login FROM users WHERE id=$1::bigint;", [id]).then(res => {
            if (res.rowCount !== 1) {
                throw new Error("illegal number of users found");
            } else {
                return new User(client, id, res.rows[0]["username"], res.rows[0]["password"] as string, res.rows[0]["components"], []);
            }
        })
    }

    public static async createNew(client: IMSClient, userName : string, password : string): Promise<User> {
        const pg = client.client;
        return pg.query("INSERT INTO users (username, password, components, ims_login) VALUES ($1, $2, $3, $4) RETURNING id;", [userName, password, [], []]).then(async res => {
            const id : BigInt = res.rows[0]["id"];
            return await User.load(client, id);
        });
    }

    public get userName(): string {
        return this._userName;
    }

    public set userName(userName: string) {
        this._userName = userName;
    }

    public static byUserName(username: string): User | undefined {
        return undefined;
    }
}