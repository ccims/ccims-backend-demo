import {Client} from "pg";
import { DBClient } from "./DBClient";

export class DatabaseElement {
    private readonly _id : string;

    protected readonly client : Client;

    protected readonly imsClient : DBClient;

    private needsSave : boolean = false;

    protected constructor(client : DBClient, id : string) {
        if (typeof id !== "string") {
            throw new Error("fix your code!!! an id must be a string!!!!!");
        }
        this.imsClient = client;
        this.client = client.client;
        this._id = id;
    }

    public async _saveToDB(): Promise<void> {
        if (this.needsSave) {
            this.needsSave = false;
            return this.save();
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

    public get id() : string {
        return this._id;
    }
}