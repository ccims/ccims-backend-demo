import { Issue } from "../domain/issues/Issue";
import { IssueComment } from "../domain/issues/IssueComment";
import { User } from "../domain/users/User";
import { Component } from "../domain/components/Component";

export interface IMSAdapter {

    getIssues(user: User): Promise<Array<Issue>>;
    getComments(issue: Issue, user: User): Promise<Array<IssueComment>>;
    createIssue(user: User, title: string, body: string): Promise<Issue>;

}