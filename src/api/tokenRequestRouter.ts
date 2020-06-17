import { Router, urlencoded } from "express";
import { DBClient } from "../domain/DBClient";
import { GitHubIMSInfo } from "../adapter/github/GitHubIMSInfo";
import path from "path";

//TODO: Save and check user data and "state"  security
export async function tokenRequestRouter(dbClient: DBClient) {
    const reqRouter = Router();

    reqRouter.get("/github", (request, response, next) => {
        response.sendFile(path.join(__dirname, "../../html/githubRequest.html"));
    });
    const githubInfo = (await dbClient.getIMSInfo(1n) as GitHubIMSInfo);
    reqRouter.post("/github", urlencoded());
    reqRouter.post("/github", (request, response, next) => {
        if (typeof request.body.ccimsUser === "string" && typeof request.body.submit === "string" && request.body.submit == "1") {
            const randomString = Buffer.from(((new Date().valueOf() >> (Math.random() * 10)) * (-Math.random() * 1000)).toString()).toString("base64");
            const splitPoint = Math.floor(Math.random() * (randomString.length - 1)) + 1;
            const state = randomString.substr(0, splitPoint) + "-" + request.body.ccimsUser + "-" + randomString.substr(splitPoint);
            response.redirect(`https://github.com/login/oauth/authorize?client_id=${githubInfo.clientId}&redirect_uri=${githubInfo.redirectUri}&state=${state}`);
            console.log(state);
            console.log(request);
        }
        next();
    });


    return reqRouter;
}