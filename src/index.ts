import * as pg from "pg";
import { config } from "./config";
import { ccimsApi } from "./api/ccimsApi";

const pgOptions: pg.ClientConfig = {
    user: config.postgres.username,
    password: config.postgres.password,
    database: config.postgres.database
};
const client = new pg.Client(pgOptions); 
/*
client.connect().then(async () => {
    let res = await client.query("SELECT date,name from helloWorld", []);
    console.log(res.rows);
    client.end();
});
*/




console.log("Hello ccims");