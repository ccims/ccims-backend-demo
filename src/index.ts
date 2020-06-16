import * as pg from "pg";
import { config } from "./config";
import { CcimsApi } from "./api/ccimsApi";
import { User } from "./domain/users/User";
import {IMSClient} from "./domain/IMSClient";

const pgOptions: pg.ClientConfig = {
    user: config.postgres.username,
    password: config.postgres.password,
    database: config.postgres.database
};
const client = new IMSClient(new pg.Client(pgOptions)); 
/*
client.connect().then(async () => {
    let res = await client.query("SELECT date,name from helloWorld", []);
    console.log(res.rows);
    client.end();
});
*/
client.client.connect().then(() => {
    User.createNew(client, "test", "hello world").then(user => {
        console.log("this worked");
        console.log(user);
    });
})


new CcimsApi(8080).start();

console.log("Hello ccims");