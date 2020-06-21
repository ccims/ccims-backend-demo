import { IMSData } from "./IMSData";
import { IMSInfo } from "./IMSInfo";
import { IMSType } from "./IMSType";
import { GitHubImsData } from "./github/GitHubIMSData";

export class IMSDataFactory {
    public static toValidIMDData(data: IMSData, info: IMSInfo): IMSData {
        switch (info.type) {
            case IMSType.GitHub:
                return IMSDataFactory.toValidGitHub(data, info);
        }
    }

    private static toValidGitHub(data: IMSData, info: IMSInfo): GitHubImsData {
        const githubData = data as GitHubImsData;
        if (typeof githubData.owner !== "string" && typeof githubData.repository !== "string") {
            throw new Error("The given ims data was invalid.");
        }
        if (typeof githubData.repositoryId === "string" && githubData.repositoryId.length > 0) {
            return {
                repository: githubData.repository,
                owner: githubData.owner,
                repositoryId: githubData.repositoryId,
            };
        } else {
            return {
                repository: githubData.repository,
                owner: githubData.owner,
                repositoryId: undefined
            }
        }
    }
}