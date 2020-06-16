import {Client} from "pg";
import { IMSClient } from "./IMSClient";

export class DatabaseElement {
    private readonly _id : string;

    protected readonly client : Client;

    protected readonly imsClient : IMSClient;

    protected constructor(client : IMSClient, id : string) {
        this.imsClient = client;
        this.client = client.client;
        this._id = id;
    }

    public get id() : string {
        return this._id;
    }
}