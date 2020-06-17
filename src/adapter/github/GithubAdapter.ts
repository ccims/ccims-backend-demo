import { IMSAdapter } from "../IMSAdapter";
import { Issue } from "../../domain/issues/Issue";
import { IssueComment } from "../../domain/issues/IssueComment";
import { IMSData } from "../IMSData";
import * as grapql from "graphql";

export class GithubAdapter implements IMSAdapter {

    private _url: string;
    private _imsData: GithubImsData;

    constructor(url: string, imsData: IMSData) {
        if (!GithubAdapter.isGithubImsData(imsData)) {
            throw new Error("The given ims Data wasn't github ims data");
        }
        this._url = url;
        this._imsData = imsData as GithubImsData;
    }

    getIssues(): Issue[] {
        throw new Error("Method not implemented.");
    }

    getComments(issue: Issue): IssueComment[] {
        throw new Error("Method not implemented.");
    }

    private static isGithubImsData(imsData: IMSData) {
        const githubData = imsData as GithubImsData;
        return typeof githubData.repository === "string" && typeof githubData.owner === "string";
    }

}

interface GithubImsData extends IMSData {
    repository: string;
    owner: string;
}