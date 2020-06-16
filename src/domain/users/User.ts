import { Client } from "pg"
import { DatabaseElement } from "../DatabaseElement";

export class User extends DatabaseElement {
    private _userName: string;

    private _password: string;

    private constructor(client: Client, id: string) {
        super(client, id);
        this._userName = "";
        this._password = "";
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