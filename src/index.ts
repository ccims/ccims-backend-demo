import * as pg from "pg";
import { config } from "./config";
import { CcimsApi } from "./api/ccimsApi";

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

new CcimsApi(8080).start();

console.log("Hello ccims");