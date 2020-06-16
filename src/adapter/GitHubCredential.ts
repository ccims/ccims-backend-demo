import { IMSCrendential } from "./IMSCredential";
import { IMSType } from "./IMSType";

export class GitHubCredential extends IMSCrendential {

    private readonly _oAuthToken : string;

    public constructor(token: string) {
        super(IMSType.GitHub);
        this._oAuthToken = token;
    }

    public get oAuthToken() : string {
        return this._oAuthToken;
    }
}