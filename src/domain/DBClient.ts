import { Client } from "pg";

export class DBClient {
    private readonly _client : Client;

    public constructor(client : Client) {
        this._client = client;
    }

    public get client() : Client {
        return this._client;
    }
}