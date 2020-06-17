import { Router, request } from "express";
import fetch from "node-fetch";
import { DBClient } from "../domain/DBClient";
import { GitHubIMSInfo } from "../adapter/github/GitHubIMSInfo";


//TODO: Save and check user data and "state"  security
export function tokenResponseRouter(dbClient: DBClient) {
    const resRouter = Router();

    resRouter.use("/github?code=:code&state=:state", (request, response, next) => {
        console.log("Token response from github: ", request.param("code"));
        next();
        if (request.param("code", undefined) !== undefined) {
            const code: string = request.param("code");
            (async () => {
                const githubInfo = (await dbClient.getIMSInfo(1n) as GitHubIMSInfo);
                console.log("Started request")
                fetch("https://github.com/login/oauth/access_token", {
                    method: "POST",
                    body: `client_id=${githubInfo.clientId}&client_secret=${githubInfo.clientSecret}&code=${code}&redirect_uri=${githubInfo.redirectUri}&state=${request.param("state")}`
                }).then(queryResponse => {
                    console.log(queryResponse);
                });
            })();
        }
    });
    return resRouter;
};