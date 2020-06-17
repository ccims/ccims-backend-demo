import { IMSCredential } from "./IMSCredential";
import { IMSType } from "./IMSType";
import { GitHubIMSInfo } from "./GitHubIMSInfo";

export class GitHubCredential extends IMSCredential {

    private readonly _oAuthToken : string;

    public constructor(info : GitHubIMSInfo, token: string) {
        super(info);
        this._oAuthToken = token;
    }

    public get oAuthToken() : string {
        return this._oAuthToken;
    }
}