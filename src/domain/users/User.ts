import { Client } from "pg"
import { DatabaseElement } from "../DatabaseElement";
import { IMSClient } from "../IMSClient";
import { IMSCrendential } from "../../adapter/IMSCredential";

export class User extends DatabaseElement {
    private _userName: string;

    private _password: string;

    private componentIDs : string[];

    private imsCredentials : IMSCrendential[];

    private constructor(client : IMSClient, id : string, userName : string, password : string, components : string[], imsCredentials : IMSCrendential[]) {
        super(client, id);
        this._userName = userName;
        this._password = password;
        this.componentIDs = components;
        this.imsCredentials = imsCredentials;
    }

    public static async load(client : IMSClient, id : string) : Promise<User> {
        let pg = client.client
        return pg.connect().then(async () => {
            let res = await pg.query("SELECT * from users WHERE id=$1", [id]);
            if (res.rowCount !== 1) {
                throw new Error("illegal number of users found");
            } else {
                return new User(client, id, res.rows[1] as string, res.rows[2] as string, res.rows[3], []);
            }
        })
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