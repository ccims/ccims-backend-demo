import {Client} from "pg";
import { DBClient } from "./DBClient";

export class DatabaseElement {
    private readonly _id : BigInt;

    protected readonly client : Client;

    protected readonly imsClient : DBClient;

    private needsSave : boolean = false;

    protected constructor(client : DBClient, id : BigInt) {
        this.imsClient = client;
        this.client = client.client;
        this._id = id;
    }

    public async saveToDB(): Promise<void> {
        if (this.needsSave) {
            this.needsSave = false;
            await this.save();
        }
    }

    /**
     * overwrite this to implement save funktionality
     * this is called to syc data to the database
     * I know that this is not the most efficient way of doing this, but it will work for now
     */
    protected async save() : Promise<void> {
        
    }

    protected invalidate() : void {
        this.needsSave = true;
    }

    public get id() : BigInt {
        return this._id;
    }
}