import { DBClient } from "../domain/DBClient";
import { IMSInfo } from "./IMSInfo";
import { GitHubIMSInfo } from "./github/GitHubIMSInfo";
import { IMSType } from "./IMSType";


export class IMSInfoProvider{
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