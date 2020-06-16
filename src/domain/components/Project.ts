<<<<<<< HEAD
import {Component} from "./Component";
import {Client} from "pg";
import { DatabaseElement } from "../DatabaseElement";

export class Project extends DatabaseElement {
    private components : Component[];

    private readonly _name: string;

    public constructor(client : Client, id : string) {
        super(client, id);
    }

    public static createProject() : Project {

    }

    public get name(): string {
        return this._name;
    }  
}