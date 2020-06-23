import { IMSInfo } from "../../adapter/IMSInfo";
import { DBClient } from "../../domain/DBClient";
import { IMSAdapter } from "../../adapter/IMSAdapter";
import { IMSType } from "../../adapter/IMSType";
import { GitHubIMSInfo } from "../../adapter/github/GitHubIMSInfo";

export class IMSResolver {

    protected readonly imsInfo: IMSInfo;
    private readonly dbClient: DBClient;

    constructor(imsInfo: IMSInfo, dbClient: DBClient) {
        this.imsInfo = imsInfo;
        this.dbClient = dbClient;
    }

    id(): string {
        return this.imsInfo.id;
    }

    type(): IMSType {
        return this.imsInfo.type;
    }

    get __typename(): string {
        return "IMS";
    }
}

export class GitHubIMSResolver extends IMSResolver {

    constructor(imsInfo: GitHubIMSInfo, dbClient: DBClient) {
        super(imsInfo, dbClient);
    }

    endpoint(): string {
        return (this.imsInfo as GitHubIMSInfo).endpoint;
    }

    redirectURI(): string {
        return (this.imsInfo as GitHubIMSInfo).redirectUri;
    }

    get __typename(): string {
        return "GitHubIMS";
    }
}