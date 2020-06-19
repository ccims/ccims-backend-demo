import * as pg from "pg";
import { config } from "./config";
import { CcimsApi } from "./api/ccimsApi";
import { User } from "./domain/users/User";
import { DBClient } from "./domain/DBClient";
import { GitHubCredential } from "./adapter/github/GitHubCredential";
import { GitHubIMSInfo } from "./adapter/github/GitHubIMSInfo";

const pgOptions: pg.ClientConfig = {
    user: config.postgres.username,
    password: config.postgres.password,
    database: config.postgres.database
};
const client = DBClient.create(pgOptions);

client.then(async client => {
    const thisWillFail = await client.getUser(3n);
    console.log(thisWillFail);
    const testUser = await client.createUser(Math.random().toString().substring(10), "hello world");
    console.log(testUser);
    testUser.password = "Niklas not so secure password";
    const ims = await client.getAllIMSInfo();
    testUser.addIMSCredential(new GitHubCredential(ims[0] as GitHubIMSInfo, "29346857"));
    console.log(testUser);
    await client.save();
    new CcimsApi(8080, client).start();
})

console.log("Hello ccims");