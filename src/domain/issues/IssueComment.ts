import { User } from "../users/User"

export class IssueComment {
    private readonly _creator: User;
    private readonly _body: string;
    private readonly _creationDate: Date;

    public constructor(creator: User, body: string, creationDate: Date) {
        this._creator = creator;
        this._body = body;
        this._creationDate = creationDate;
    }

    public get creator(): User {
        return this._creator;
    }

    public get body(): string {
        return this._body;
    }

    public get greationDate(): Date {
        return this._creationDate;
    }
}