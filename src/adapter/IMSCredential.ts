import { IMSType } from "./IMSType";
import { TypeNode, Token } from "graphql";
import { GitHubCredential } from "./GitHubCredential";

export class IMSCrendential {
    private readonly _type : IMSType;

    protected constructor(type : IMSType) {
        this._type = type;
    }

    public get type() : IMSType {
        return this._type;
    }

    public static parse(type : string, data : string) : IMSCrendential {
        switch (IMSType[type  as keyof typeof IMSType]) {
            case IMSType.GitHub:
                return new GitHubCredential(data);
            default:
                throw new Error("no type");
        }
    }
}