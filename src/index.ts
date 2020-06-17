import * as pg from "pg";
import { config } from "./config";
import { CcimsApi } from "./api/ccimsApi";
import { User } from "./domain/users/User";
import {DBClient} from "./domain/DBClient";

const pgOptions: pg.ClientConfig = {
    user: config.postgres.username,
    password: config.postgres.password,
    database: config.postgres.database
};
const client = DBClient.create(pgOptions);
/*
client.connect().then(async () => {
    let res = await client.query("SELECT date,name from helloWorld", []);
    console.log(res.rows);
    client.end();
});
*/
client.then(client => {
        client.createUser("test", "hello world").then(user => {
        console.log("this worked");
        console.log(user);
    });
})



new CcimsApi(8080).start();

console.log("Hello ccims");