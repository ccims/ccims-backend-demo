import { Router, response } from "express";
import { DBClient } from "../domain/DBClient";
import { GitHubIMSInfo } from "../adapter/github/GitHubIMSInfo";

export async function tokenRequestRouter(dbClient: DBClient) {
    const reqRouter = Router();

    reqRouter.get("/github", (request, response, next) => {
        response.sendFile("html/githubRequest.html");
    });
    const clientId = (await dbClient.getIMSInfo(0n) as GitHubIMSInfo).clientId;
    reqRouter.post("/github", (request, response, next) => {
        const randomString = btoa(((new Date().valueOf() >> (Math.random() * 10)) * (-Math.random() * 1000)).toString());
        const splitPoint = Math.floor(Math.random() * (randomString.length - 1)) + 1;
        const state = randomString.substr(0, splitPoint) + request.params["ccimsUser"] + randomString.substr(splitPoint);
        //response.redirect(`https://github.com/login/oauth/authorize?client_id=${}&`);
        console.log(randomString);
    });

    return reqRouter;
}