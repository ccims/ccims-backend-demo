import { IMSCredentialInfo } from "./IMSCredentialInfo";
import { IMSType } from "./IMSType";

export class GithubCredentialInfo extends IMSCredentialInfo {

    private readonly _endpoint: string;

    public constructor(endpoint: string) {
        super(IMSType.GitHub);
        this._endpoint = endpoint;
    }

    public get endpoint() {
        return this._endpoint;
    }
}