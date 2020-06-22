import { Issue } from "../domain/issues/Issue";
import { IssueComment } from "../domain/issues/IssueComment";
import { User } from "../domain/users/User";
import { Component } from "../domain/components/Component";
import { IssueType } from "../domain/issues/IssueType";

export interface IMSAdapter {

    getIssue(user: User, id: string): Promise<Issue>;
    getComments(issue: Issue, user: User): Promise<Array<IssueComment>>;
    createIssue(user: User, title: string, body: string, type: IssueType): Promise<Issue>;
    removeIssue(user: User, issue: Issue): Promise<boolean>;

}