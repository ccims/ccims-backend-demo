import { Client, ClientConfig } from "pg";
import {User} from "./users/User";
import { IMSInfo } from "../adapter/IMSInfo";
import { IMSInfoProvider } from "../adapter/IMSInfoProvider";
import { DummyUser } from "./users/DummyUser";

export class DBClient {
    private readonly _client : Client;

    private readonly _defaultUser: User;

    private readonly users: Map<BigInt, User>;
    private readonly imsInfos: Map<BigInt, IMSInfo>;

    private constructor(client : Client) {
        this._client = client;
        this.users = new Map();
        this.imsInfos = new Map();
        this._defaultUser = new DummyUser(this);
        this.users.set(this._defaultUser.id, this._defaultUser);
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
        return this.getUserByUsername(userName).then(
            () => {throw new Error("username already in use")},
            async () => User.create(this, userName, password));
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

    public async getUserByUsername(username: String): Promise<User> {
        const res = await this.client.query("SELECT id FROM users WHERE username = $1", [username]);
        if (res.rowCount == 1) {
            return this.getUser(res.rows[0]["id"]);
        } else {
            throw new Error("no user found");
        }
    }

    public async getIMSInfo(id: BigInt): Promise<IMSInfo> {
        if (this.imsInfos.has(id)) {
            return this.imsInfos.get(id) as IMSInfo;
        } else {
            const newInfo = await IMSInfoProvider.load(this, id);
            this.imsInfos.set(id, newInfo);
            return newInfo;
        }
        
    }

    public get defaultUser(): User {
        return this._defaultUser;
    }

    public save(): void {
        this.users.forEach(user => user.saveToDB());
    }

}