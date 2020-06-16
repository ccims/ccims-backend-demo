import {Client} from "pg";

export class DatabaseElement {
    private readonly _id : string;

    protected readonly client : Client;

    protected constructor(client : Client, id : string) {
        this.client = client;
        this._id = id;
    }

    public get id() : string {
        return this._id;
    }
}