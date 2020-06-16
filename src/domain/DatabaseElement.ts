import {Client} from "pg";
import { IMSClient } from "./IMSClient";

export class DatabaseElement {
    private readonly _id : BigInt;

    protected readonly client : Client;

    protected readonly imsClient : IMSClient;

    protected constructor(client : IMSClient, id : BigInt) {
        this.imsClient = client;
        this.client = client.client;
        this._id = id;
    }

    public get id() : BigInt {
        return this._id;
    }
}