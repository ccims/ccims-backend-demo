import { IMSType } from "./IMSType";
import { DBClient } from "../domain/DBClient";
import { GithubCredentialInfo } from "./GithubCredentialInfo";

export class IMSCredentialInfo {
    private readonly _type : IMSType;

    protected constructor (type : IMSType) {
        this._type = type;
    }

    public get type() : IMSType {
        return this._type;
    }

    public static async load(client : DBClient, id : BigInt) : Promise<IMSCredentialInfo> {
        const pq = client.client;
        return pq.query("SELECT type, data FROM issue_managemant_systems WHERE id=$1::bigint;", [id]).then(result => {
            switch (IMSType[result.rows[0]["type"] as keyof typeof IMSType]) {
                case IMSType.GitHub:
                    return new GithubCredentialInfo(result.rows[0]["data"]);
            }
        });
    }
}