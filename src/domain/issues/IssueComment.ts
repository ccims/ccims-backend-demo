import {User} from "../users/User"

export class IssueComment {
    private readonly _creator : User;

    private readonly _body : string;

    public constructor (creator : User, body : string) {
        this._creator = creator;
        this._body = body;
    }

    public get creator() : User {
        return this._creator;
    }

    public get body() : string {
        return this._body;
    }
}