import { IMSType } from "./IMSType";
import { TypeNode, Token } from "graphql";
import { GitHubCredential } from "./GitHubCredential";
import { IMSInfo } from "./IMSInfo";
import { GitHubIMSInfo } from "./GitHubIMSInfo";

export class IMSCredential {
    private readonly _info : IMSInfo;

    protected constructor(info : IMSInfo) {
        this._info = info;
    }

    public get info() : IMSInfo {
        return this._info;
    }

    public static parse(info: IMSInfo, data : string) : IMSCredential {
        switch (info.type) {
            case IMSType.GitHub:
                return new GitHubCredential(info as GitHubIMSInfo, data);
            default:
                throw new Error("no type");
        }
    }
}