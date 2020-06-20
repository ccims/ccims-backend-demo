import { Router, request } from "express";
import fetch from "node-fetch";
import { DBClient } from "../domain/DBClient";
import { GitHubIMSInfo } from "../adapter/github/GitHubIMSInfo";
import { IMSType } from "../adapter/IMSType";
import { GitHubCredential } from "../adapter/github/GitHubCredential";
import { User } from "../domain/users/User";


//TODO: Save and check user data and "state"  security
export function tokenResponseRouter(dbClient: DBClient) {
    const resRouter = Router();

    resRouter.use("/github?code=:code&state=:state", (request, response, next) => {
        console.log("Token response from github: ", request.param("code"));
        next();
        if (request.param("code", undefined) !== undefined) {
            const code: string = request.param("code");
            (async () => {
                const githubInfo = (await dbClient.getAllIMSInfo()).filter(info => info.type == IMSType.GitHub)[0] as GitHubIMSInfo;
                if (githubInfo) {
                    console.log("Started request")
                    fetch("https://github.com/login/oauth/access_token", {
                        method: "POST",
                        body: `client_id=${githubInfo.clientId}&client_secret=${githubInfo.clientSecret}&code=${code}&redirect_uri=${githubInfo.redirectUri}&state=${request.param("state")}`
                    }).then(async queryResponse => {
                        const responseData = (await queryResponse.json()) as GithubAccessTokenResponse;
                        const credentials = new GitHubCredential(githubInfo, responseData.access_token);
                        const user = await dbClient.getUserByUsername(request.param("state").split("-")[1]);
                        if (user) {
                            user.addIMSCredential(credentials);
                        }
                        console.log(responseData);

                    });
                }
            })();
        }
    });
    return resRouter;
};

interface GithubAccessTokenResponse {
    access_token: string,
    expires_in: string,
    refresh_token: string,
    refresh_token_expires_in: string,
    scope: string,
    token_type: string
}