import { Component } from "./Component";
import { Client } from "pg";

export class Project {
    private components: Component[];

    private readonly pg: Client;

    private readonly _name: string;

    public constructor(pg: Client) {
        this.components = [];
        this.pg = pg;
        this._name = "";
    }

    public static loadAllProjects(client: Client) {

    }

    public get name(): string {
        return this._name;
    }
}