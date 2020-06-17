import { IMSInfo } from "../IMSInfo";
import { IMSType } from "../IMSType";
import { DBClient } from "../../domain/DBClient";

export class GitHubIMSInfo extends IMSInfo {

    private readonly _endpoint: string;
    private readonly _clientId: string;

    public constructor(client: DBClient, id: BigInt, data: string) {
        super(client, id, IMSType.GitHub);
        const dataParsed = JSON.parse(data) as GithubImsData;
        if (!GitHubIMSInfo.isGithubData(dataParsed)) {
            throw new Error("The given data wasn''t github data");
        }
        this._endpoint = dataParsed.endpoint;
        this._clientId = dataParsed.clientId;
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

    public get clientId(): string {
        return this._clientId;
    }

    private static isGithubData(data: GithubImsData): boolean {
        return typeof data.clientId === "string" && typeof data.endpoint === "string";
    }
}

interface GithubImsData {
    endpoint: string;
    clientId: string;
}