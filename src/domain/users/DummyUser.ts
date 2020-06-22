import { User } from "./User";
import { DBClient } from "../DBClient";

export class DummyUser extends User {
    public constructor(client: DBClient) {
        super(client, -1n, "dummy user", "password", new Set(), new Set());
    }

    protected async save(): Promise<void> {
        //just do nothing
    }
}