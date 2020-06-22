import { IMSCredential } from "./IMSCredential";
import { IMSInfo } from "./IMSInfo";
import { GitHubCredential } from "./github/GitHubCredential";
import { GitHubIMSInfo } from "./github/GitHubIMSInfo";
import { DBClient } from "../domain/DBClient";
import { IMSInfoProvider } from "./IMSInfoProvider";
import { IMSType } from "./IMSType";

export class IMSCredentialProvider {
    public static parse(info: IMSInfo, data : string) : IMSCredential {
        switch (info.type) {
            case IMSType.GitHub:
                return new GitHubCredential(info as GitHubIMSInfo, data);
            default:
                throw new Error("no type");
        }
    }

    public static async parseAsync(client: DBClient, id: string, secret: string): Promise<IMSCredential> {
        const info = await client.getIMSInfo(id);
        return IMSCredentialProvider.parse(info, secret);
    }
}