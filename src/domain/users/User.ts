import { DatabaseElement } from "../DatabaseElement";
import { DBClient } from "../DBClient";
import { IMSCredential } from "../../adapter/IMSCredential";
import {Component} from "../components/Component";
import { IMSInfo } from "../../adapter/IMSInfo";

export class User extends DatabaseElement {
    private _userName: string;

    private _password: string;

    private componentIDs : Set<BigInt>;

    private imsCredentials : Map<IMSInfo, IMSCredential>;

    private constructor(client : DBClient, id : BigInt, userName : string, password : string, components : BigInt[], imsCredentials : IMSCredential[]) {
        super(client, id);
        this._userName = userName;
        this._password = password;
        this.componentIDs = new Set(components);
        this.imsCredentials = new Map();
        imsCredentials.forEach(credential => this.imsCredentials.set(credential.info, credential))
    }

    public static async load(client : DBClient, id : BigInt) : Promise<User> {
        const pg = client.client;
        return pg.query("SELECT id, username, password, components, ims_login FROM users WHERE id=$1::bigint;", [id]).then(res => {
            if (res.rowCount !== 1) {
                throw new Error("illegal number of users found");
            } else {
                return new User(client, id, res.rows[0]["username"], res.rows[0]["password"] as string, res.rows[0]["components"], []);
            }
        })
    }

    public static async create(client: DBClient, userName : string, password : string): Promise<User> {
        const pg = client.client;
        return pg.query("INSERT INTO users (username, password, components, ims_login) VALUES ($1, $2, $3, $4) RETURNING id;", 
            [userName, password, [], []]).then(async res => {
                const id : BigInt = res.rows[0]["id"];
                return await User.load(client, id);
            });
    }

    protected async save(): Promise<void> {
        this.client.query("UPDATE users SET username = $1, password = $2, components = $3, ims_login = $4 WHERE id = $5", 
            [this._userName, this._password, this.componentIDs, Array.from(this.imsCredentials, ([key, value]) => value.getData()), this.id]);
    }

    public addComponent(component : Component): void {
        this.componentIDs.add(component.id);
        this.invalidate();
    }

    public removeComponent(component: Component): void {
        this.componentIDs.delete(component.id);
        this.invalidate();
    }

    public addIMSCredential(credential: IMSCredential) {
        this.imsCredentials.set(credential.info, credential);
        this.invalidate();
    }

    public removeIMSCredential(credentialInfo: IMSInfo): void {
        this.imsCredentials.delete(credentialInfo);
        this.invalidate();
    }

    public getIMSCredential(info: IMSInfo): IMSCredential | undefined {
        return this.imsCredentials.get(info);
    }

    public get userName(): string {
        return this._userName;
    }

    public set userName(userName: string) {
        this._userName = userName;
        this.invalidate();
    }

    public static byUserName(username: string): User | undefined {
        return undefined;
    }

    
    public get password() : string {
        return this._password;
    }
    public set password(password : string) {
        this._password = password;
        this.invalidate();
    }
    
    
}