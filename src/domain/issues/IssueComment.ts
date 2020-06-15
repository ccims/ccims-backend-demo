import {User} from "../users/User"

export class IssueComment {
    private readonly _creator : User;

    public constructor (creator : User, _body : string) {
        this._creator = creator;
    }

    public get creator() : User {
        return this._creator;
    }

    //public getLinkedIssues
}