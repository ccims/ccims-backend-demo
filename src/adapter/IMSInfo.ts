import { IMSType } from "./IMSType";
import { DBClient } from "../domain/DBClient";
import { GitHubIMSInfo } from "./GitHubIMSInfo";
import { DatabaseElement } from "../domain/DatabaseElement";

export class IMSInfo extends DatabaseElement {
    private readonly _type : IMSType;

    protected constructor (client: DBClient, id: BigInt, type : IMSType) {
        super(client, id);
        this._type = type;
    }

    public get type() : IMSType {
        return this._type;
    }

    public static async load(client : DBClient, id : BigInt) : Promise<IMSInfo> {
        const pq = client.client;
        return pq.query("SELECT type, data FROM issue_managemant_systems WHERE id=$1::bigint;", [id]).then(result => {
            switch (IMSType[result.rows[0]["type"] as keyof typeof IMSType]) {
                case IMSType.GitHub:
                    return new GitHubIMSInfo(client, id, result.rows[0]["data"]);
            }
        });
    }
}