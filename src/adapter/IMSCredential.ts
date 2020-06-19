import { IMSType } from "./IMSType";
import { TypeNode, Token } from "graphql";
import { GitHubCredential } from "./github/GitHubCredential";
import { IMSInfo } from "./IMSInfo";
import { GitHubIMSInfo } from "./github/GitHubIMSInfo";
import { DBClient } from "../domain/DBClient";
import { IMSInfoProvider } from "./IMSInfoProvider";

export abstract class IMSCredential {
    private readonly _info : IMSInfo;

    protected constructor(info : IMSInfo) {
        this._info = info;
    }

    public get info() : IMSInfo {
        return this._info;
    }

    public abstract getData(): string;
}