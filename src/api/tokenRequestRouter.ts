import { Router, urlencoded } from "express";
import { DBClient } from "../domain/DBClient";
import { GitHubIMSInfo } from "../adapter/github/GitHubIMSInfo";
import path from "path";

export async function tokenRequestRouter(dbClient: DBClient) {
    const reqRouter = Router();

    reqRouter.get("/github", (request, response, next) => {
        response.sendFile(path.join(__dirname, "../../html/githubRequest.html"));
        next();
    });
    const clientId = (await dbClient.getIMSInfo(1n) as GitHubIMSInfo).clientId;
    reqRouter.post("/github", (request, response, next) => {
        const randomString = Buffer.from(((new Date().valueOf() >> (Math.random() * 10)) * (-Math.random() * 1000)).toString()).toString("base64");
        const splitPoint = Math.floor(Math.random() * (randomString.length - 1)) + 1;
        const state = randomString.substr(0, splitPoint) + ";" + request.params["ccimsUser"] + ";" + randomString.substr(splitPoint);
        //response.redirect(`https://github.com/login/oauth/authorize?client_id=${}&`);
        console.log(state);
        console.log(request.body);
        next();
    });

    reqRouter.post("/github", urlencoded());

    return reqRouter;
}