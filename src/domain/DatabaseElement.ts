import {Client} from "pg";
import { DBClient } from "./DBClient";

export class DatabaseElement {
    private readonly _id : BigInt;

    protected readonly client : Client;

    protected readonly imsClient : DBClient;

    protected constructor(client : DBClient, id : BigInt) {
        this.imsClient = client;
        this.client = client.client;
        this._id = id;
    }

    public saveToDB(): void {

    }

    public get id() : BigInt {
        return this._id;
    }
}