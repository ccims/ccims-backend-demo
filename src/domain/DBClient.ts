import { Client, ClientConfig } from "pg";
import { User } from "./users/User";
import { IMSInfo } from "../adapter/IMSInfo";
import { IMSInfoProvider } from "../adapter/IMSInfoProvider";
import { DummyUser } from "./users/DummyUser";
import { Project } from "./components/Project";
import { Component } from "./components/Component";
import { IMSCredential } from "../adapter/IMSCredential";
import { IMSData } from "../adapter/IMSData";

export class DBClient {
    private readonly _client: Client;

    private readonly _defaultUser: User;

    private readonly users: Map<BigInt, User>;
    private readonly imsInfos: Map<BigInt, IMSInfo>;
    private readonly projects: Map<BigInt, Project>;
    private readonly components: Map<BigInt, Component>;

    private constructor(client: Client) {
        this._client = client;
        this.users = new Map();
        this.imsInfos = new Map();
        this.projects = new Map();
        this.components = new Map();

        this._defaultUser = new DummyUser(this);
        this.users.set(this._defaultUser.id, this._defaultUser);
    }

    public static async create(config: ClientConfig): Promise<DBClient> {
        const client = new Client(config);
        await client.connect();
        return new DBClient(client);
    }

    public get client(): Client {
        return this._client;
    }

    public async createUser(userName: string, password: string): Promise<User> {
        return this.getUserByUsername(userName).then(
            () => { throw new Error("username already in use") },
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

    public async getAllIMSInfo(): Promise<IMSInfo[]> {
        const res = await this.client.query("SELECT id FROM users");
        return Promise.all(res.rows.map(row => row["id"]).map(id => this.getIMSInfo(id)));
    }

    public async createProject(name: string, description: string, owner: User): Promise<Project> {
        return Project.create(this, name, description, owner);
    }

    public async getProject(id: BigInt): Promise<Project> {
        if (this.projects.has(id)) {
            return this.projects.get(id) as Project;
        } else {
            const newProject = await Project.load(this, id);
            this.projects.set(id, newProject);
            return newProject;
        }
    }

    public async createComponent(name: string, description: string, project: Project, ims: IMSInfo, owner: User, imsData: IMSData): Promise<Component> {
        return Component.create(this, name, description, project, ims, owner, imsData);
    }

    public async getComponent(id: BigInt): Promise<Component> {
        if (this.components.has(id)) {
            return this.components.get(id) as Component;
        } else {
            const newComponent = await Component.load(this, id);
            this.components.set(id, newComponent);
            return newComponent;
        }
    }

    public get defaultUser(): User {
        return this._defaultUser;
    }

    public save(): void {
        this.users.forEach(user => user.saveToDB());
    }

}