import { Client, ClientConfig } from "pg";
import {User} from "./users/User";
import { IMSInfo } from "../adapter/IMSInfo";

export class DBClient {
    private readonly _client : Client;

    private readonly users: Map<BigInt, User>;
    private readonly imsInfos: Map<BigInt, IMSInfo>;

    private constructor(client : Client) {
        this._client = client;
        this.users = new Map();
        this.imsInfos = new Map();
    }

    public static async create(config: ClientConfig): Promise<DBClient> {
        const client = new Client(config);
        await client.connect();
        return new DBClient(client);
    }

    public get client() : Client {
        return this._client;
    }

    public async createUser(userName : string, password : string): Promise<User> {
        return User.create(this, userName, password);
    }

    public async getUser(id: BigInt): Promise<User> {
        if (this.users.has(id)) {
            return this.users.get(id) as User;
        } else {
            const newUser = await User.load(this, id);
            this.users.set(id, newUser);
            return newUser;
        }
    }

    public async getIMSInfo(id: BigInt): Promise<IMSInfo> {
        if (this.imsInfos.has(id)) {
            return this.imsInfos.get(id) as IMSInfo;
        } else {
            const newInfo = await IMSInfo.load(this, id);
            this.imsInfos.set(id, newInfo);
            return newInfo;
        }
        
    }

    public save(): void {
        this.users.forEach(user => user.saveToDB());
    }

}