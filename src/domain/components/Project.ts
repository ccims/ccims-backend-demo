import {Component} from "./Component";
import {Client} from "pg";
import { DatabaseElement } from "../DatabaseElement";

export class Project extends DatabaseElement {
    private components : Component[];

    public constructor(client : Client, id : string) {
        super(client, id);
    }

    public static createProject() : Project {
        
    }
}