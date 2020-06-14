import * as pg from "pg";
import { config } from "./config";

const pgOptions: pg.ClientConfig = {
    user: config.postgres.username,
    password: config.postgres.password
};
const client = new pg.Client(pgOptions);

console.log("Hello ccims");