import {Component} from "./Component";
import {Client} from "pg";

export class Project {
    private components : Component[];

    private readonly pg : Client;

    public constructor(pg : Client) {
        this.components = [];
        this.pg = pg;
        
    }

    public static loadAllProjects(client : Client) {
        
    }
}