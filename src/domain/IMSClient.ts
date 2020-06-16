import { Client } from "pg";

export class IMSClient {
    private readonly _client : Client;

    public constructor(client : Client) {
        this._client = client;
    }

    public get client() : Client {
        return this._client;
    }
}