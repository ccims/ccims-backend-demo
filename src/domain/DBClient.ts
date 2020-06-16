import { Client, ClientConfig } from "pg";

export class DBClient {
    private readonly _client : Client;

    private constructor(client : Client) {
        this._client = client;
    }

    public static async create(config: ClientConfig): Promise<DBClient> {
        const client = new Client(config);
        await client.connect();
        return new DBClient(client);
    }

    public get client() : Client {
        return this._client;
    }
}