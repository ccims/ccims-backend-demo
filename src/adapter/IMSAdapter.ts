import { Issue } from "../domain/issues/Issue";
import { IssueComment } from "../domain/issues/IssueComment";

export interface IMSAdapter {

    getIssues(): Array<Issue>;
    getComments(issue: Issue): Array<IssueComment>;


}