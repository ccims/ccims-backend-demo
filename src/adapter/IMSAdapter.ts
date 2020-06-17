import { Issue } from "../domain/issues/Issue";
import { IssueComment } from "../domain/issues/IssueComment";
import { User } from "../domain/users/User";

export interface IMSAdapter {

    getIssues(user: User): Promise<Array<Issue>>;
    getComments(issue: Issue, user: User): Promise<Array<IssueComment>>;


}