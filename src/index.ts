import * as pg from "pg";
import { config } from "./config";
import { CcimsApi } from "./api/ccimsApi";
import { User } from "./domain/users/User";
import { DBClient } from "./domain/DBClient";
import { GitHubCredential } from "./adapter/github/GitHubCredential";
import { GitHubIMSInfo } from "./adapter/github/GitHubIMSInfo";
import { Component } from "./domain/components/Component";
import { IMSInfoProvider } from "./adapter/IMSInfoProvider";
import { IMSData } from "./adapter/IMSData";
import { GitHubImsData } from "./adapter/github/GitHubIMSData";

const pgOptions: pg.ClientConfig = {
    user: config.postgres.username,
    password: config.postgres.password,
    database: config.postgres.database
};
const client = DBClient.create(pgOptions);

client.then(async client => {

    const thisWillFail = client.getUser(3n).catch(e => console.error("This wil fail: ", e));
    console.log(thisWillFail);
    const testUser = await client.createUser(Math.random().toString().substring(10), "hello world");
    console.log(testUser);
    testUser.password = "Niklas not so secure password";
    const ims = await client.getAllIMSInfo();
    testUser.addIMSCredential(new GitHubCredential(ims[0] as GitHubIMSInfo, "29346857"));
    console.log(testUser);
    const testProject = await client.createProject("my project", "this is my project", testUser);
    const imsData : GitHubImsData = {repository: "https://www.github.com/nk-coding/TuringSchlimmulator", owner:"nk-coding"};
    const testComponent = await client.createComponent("testComponent", "this is my custom test component", await testProject, await client.getIMSInfo(1n), testUser, imsData);
    console.log(testProject);
    console.log(testComponent);
    await client.save();
    new CcimsApi(8080, client).start();
})

console.log("Hello ccims");