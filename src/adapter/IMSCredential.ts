import { IMSType } from "./IMSType";
import { TypeNode, Token } from "graphql";
<<<<<<< HEAD
import { GitHubCredential } from "./GitHubCredential";
import { IMSInfo } from "./IMSInfo";
import { GithubIMSInfo } from "./GitHubIMSInfo";

export class IMSCredential {
    private readonly _info : IMSInfo;

    protected constructor(info : IMSInfo) {
        this._info = info;
    }

    public get info() : IMSInfo {
        return this._info;
    }

    public static parse(info: IMSInfo, data : string) : IMSCredential {
=======
import { GitHubCredential } from "./github/GitHubCredential";
import { IMSCredentialInfo } from "./IMSCredentialInfo";
import { GithubCredentialInfo } from "./GithubCredentialInfo";

export class IMSCredential {
    private readonly _info: IMSCredentialInfo;

    protected constructor(info: IMSCredentialInfo) {
        this._info = info;
    }

    public get info(): IMSCredentialInfo {
        return this._info;
    }

    public static parse(info: IMSCredentialInfo, data: string): IMSCredential {
>>>>>>> 13699d12883fcf16864d111bcc8cdb61b2a7de50
        switch (info.type) {
            case IMSType.GitHub:
                return new GitHubCredential(info as GithubIMSInfo, data);
            default:
                throw new Error("no type");
        }
    }
}