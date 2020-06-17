import { IMSType } from "./IMSType";
import { TypeNode, Token } from "graphql";
import { GitHubCredential } from "./GitHubCredential";
import { IMSCredentialInfo } from "./IMSCredentialInfo";
import { GithubCredentialInfo } from "./GithubCredentialInfo";

export class IMSCredential {
    private readonly _info : IMSCredentialInfo;

    protected constructor(info : IMSCredentialInfo) {
        this._info = info;
    }

    public get info() : IMSCredentialInfo {
        return this._info;
    }

    public static parse(info: IMSCredentialInfo, data : string) : IMSCredential {
        switch (info.type) {
            case IMSType.GitHub:
                return new GitHubCredential(info as GithubCredentialInfo, data);
            default:
                throw new Error("no type");
        }
    }
}