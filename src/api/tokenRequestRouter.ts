import { Router, urlencoded } from "express";
import { DBClient } from "../domain/DBClient";
import { GitHubIMSInfo } from "../adapter/github/GitHubIMSInfo";
import path from "path";
import { IMSType } from "../adapter/IMSType";
import { IMSCredential } from "../adapter/IMSCredential";
import { GitHubCredential } from "../adapter/github/GitHubCredential";

export function tokenRequestRouter(dbClient: DBClient) {
    const reqRouter = Router();

    reqRouter.get("/github", (request, response, next) => {
        response.sendFile(path.join(__dirname, "../../html/githubRequest.html"));
    });
    reqRouter.post("/github", urlencoded({
        extended: false
    }));
    reqRouter.post("/github", async (request, response, next) => {
        const githubInfo = (await dbClient.getAllIMSInfo()).filter(info => info.type == IMSType.GitHub)[0] as GitHubIMSInfo;
        if (githubInfo) {
            if (typeof request.body.ccimsUser === "string" && typeof request.body.submit === "string" && request.body.submit == "1") {
                const randomString = Buffer.from(((new Date().valueOf() >> (Math.random() * 10)) * (-Math.random() * 1000)).toString()).toString("base64");
                const splitPoint = Math.floor(Math.random() * (randomString.length - 1)) + 1;
                const user = dbClient.getUserByUsername(request.body.ccimsUser).then((user) => {
                    const state = encodeURIComponent(randomString.substr(0, splitPoint) + "-" + user.userName + "-" + randomString.substr(splitPoint));
                    user.addIMSCredential(new GitHubCredential(githubInfo, state));
                    dbClient.save();
                    const clientEncoded = encodeURIComponent(githubInfo.clientId);
                    const redirectEncoded = encodeURIComponent(githubInfo.redirectUri);
                    const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${clientEncoded}&redirect_uri=${redirectEncoded}&state=${state}`;
                    console.log(state);
                    console.log(redirectUrl);
                    response.redirect(redirectUrl);
                    next();
                }).catch(err => {
                    response.status(400).send("The given user wasn't found");
                    next();
                });
            }
        } else {
            response.status(500).send("No github ims info found");
            next();
        }
    });


    return reqRouter;
}