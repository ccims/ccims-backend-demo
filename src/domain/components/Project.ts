import {Component} from "./Component";
import {Client} from "pg";
import { DatabaseElement } from "../DatabaseElement";
import { DBClient } from "../DBClient";
import { ExecFileSyncOptionsWithStringEncoding } from "child_process";

export class Project extends DatabaseElement {
    private components : string[];

    private readonly _name: string;

    public constructor(client : DBClient, id : BigInt, name : string, components : string[]) {
        super(client, id);
        this._name = name;
        this.components = components;
    }

    public get name(): string {
        return this._name;
    }  
}