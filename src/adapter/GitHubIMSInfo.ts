import { IMSInfo } from "./IMSInfo";
import { IMSType } from "./IMSType";
import { DBClient } from "../domain/DBClient";

export class GitHubIMSInfo extends IMSInfo {

    private readonly _endpoint: string;

    public constructor(client: DBClient, id: BigInt, endpoint: string) {
        super(client, id, IMSType.GitHub);
        this._endpoint = endpoint;
    }

    public get endpoint() {
        return this._endpoint;
    }
}