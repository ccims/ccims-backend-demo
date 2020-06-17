import { IMSInfo } from "../IMSInfo";
import { IMSType } from "../IMSType";
import { DBClient } from "../../domain/DBClient";

export class GitHubIMSInfo extends IMSInfo {

    private readonly _endpoint: string;

    public constructor(client: DBClient, id: BigInt, endpoint: string) {
        super(client, id, IMSType.GitHub);
        this._endpoint = endpoint;
    }

    public static async create(client: DBClient, endpoint: string): Promise<GitHubIMSInfo> {
        const pg = client.client;
        return pg.query("INSERT INTO issue_management_systems (type, data) VALUES ($1, $2) RETURNING id;", [IMSType.GitHub, endpoint]).then(result => {
            return new GitHubIMSInfo(client, result.rows[0]["id"], endpoint);
        })
    }

    public get endpoint() {
        return this._endpoint;
    }
}