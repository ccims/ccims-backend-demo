import { IMSData } from "../IMSData";

export interface GitHubImsData extends IMSData {
    repository: string;
    owner: string;
    repositoryId?: string;
}