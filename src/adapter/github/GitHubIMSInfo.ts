import { IMSInfo } from "../IMSInfo";
import { IMSType } from "../IMSType";
import { DBClient } from "../../domain/DBClient";

export class GitHubIMSInfo extends IMSInfo {

    private readonly _endpoint: string;
    private readonly _clientId: string;
    private readonly _clientSecret: string;
    private readonly _redirectUri: string;

    public constructor(client: DBClient, id: string, data: string) {
        super(client, id, IMSType.GitHub);
        const dataParsed = JSON.parse(data) as GithubImsData;
        if (!GitHubIMSInfo.isGithubData(dataParsed)) {
            throw new Error("The given data wasn't github data");
        }
        this._endpoint = dataParsed.endpoint;
        this._clientId = dataParsed.clientId;
        this._clientSecret = dataParsed.clientSecret;
        this._redirectUri = dataParsed.redirectUri;
    }

    public static async _create(client: DBClient, endpoint: string): Promise<GitHubIMSInfo> {
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

    public get clientSecret(): string {
        return this._clientSecret;
    }

    public get redirectUri(): string {
        return this._redirectUri;
    }

    private static isGithubData(data: GithubImsData): boolean {
        return typeof data.clientId === "string" && typeof data.endpoint === "string" && typeof data.clientSecret === "string" && typeof data.redirectUri === "string";
    }
}

interface GithubImsData {
    endpoint: string;
    clientId: string;
    clientSecret: string;
    redirectUri: string;
}