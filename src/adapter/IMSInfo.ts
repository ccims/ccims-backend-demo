import { IMSType } from "./IMSType";
import { DBClient } from "../domain/DBClient";
import { DatabaseElement } from "../domain/DatabaseElement";

export class IMSInfo extends DatabaseElement {
    private readonly _type : IMSType;

    protected constructor (client: DBClient, id: string, type : IMSType) {
        super(client, id);
        this._type = type;
    }

    public get type() : IMSType {
        return this._type;
    }
}