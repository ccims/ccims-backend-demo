import { DatabaseElement } from "../DatabaseElement";
import { IMSClient } from "../IMSClient";

export class User extends DatabaseElement {
    private _userName : string;

    private _password : string;

    private componentIDs : string[];

    private constructor(client : IMSClient, id : string, userName : string, password : string, components : string[], ) {
        super(client, id);
        this._userName = userName;
        this._password = password;
    }

    public static async load(client : IMSClient, id : string) : Promise<User> {
        let pg = client.client
        return pg.connect().then(async () => {
            let res = await pg.query("SELECT * from users WHERE id=$1", [id]);
            if (res.rowCount !== 1) {
                throw new Error("illegal number of users found");
            } else {
                return new User(client, id, , "");
            }
        })
    }

    public get userName() : string {
        return this._userName;
    }

    public set userName(userName : string) {
        this._userName = userName;
    }

    public static byUserName() : User | undefined {
        return undefined;
    }

}