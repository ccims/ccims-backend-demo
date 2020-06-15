import { IMSAdapter } from "../../adapter/IMSAdapter";
import {Project} from "./Project";

export class Component {
    private readonly _name : string;

    private readonly imsAdapter : IMSAdapter;

    public constructor(name : string, project : Project, imsAdapter : IMSAdapter) {
        this._name = name;
        this.imsAdapter = imsAdapter;
    }

    public get name() : string {
        return this._name;
    }
}