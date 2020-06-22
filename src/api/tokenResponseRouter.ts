import { Router, request } from "express";
import fetch from "node-fetch";
import { DBClient } from "../domain/DBClient";
import { GitHubIMSInfo } from "../adapter/github/GitHubIMSInfo";
import { IMSType } from "../adapter/IMSType";
import { GitHubCredential } from "../adapter/github/GitHubCredential";
import { User } from "../domain/users/User";
import { Cipher } from "crypto";


//TODO: Save and check user data and "state"  security
export function tokenResponseRouter(dbClient: DBClient) {
    const resRouter = Router();

    resRouter.use("/github", (request, response, next) => {
        console.log("Token response from github: ", request.query["code"]);
        response.send("Token will be added");
        next();
        if (request.query["code"] !== undefined) {
            const code: string = request.query["code"] as string;
            (async () => {
                const githubInfo = (await dbClient.getAllIMSInfo()).filter(info => info.type == IMSType.GitHub)[0] as GitHubIMSInfo;
                if (githubInfo) {
                    console.log("Started request");
                    /*const fetchTokenRequest = new URLSearchParams();
                    fetchTokenRequest.append("client_id", githubInfo.clientId);
                    fetchTokenRequest.append("client_secret", githubInfo.clientSecret);
                    fetchTokenRequest.append("code", code);
                    fetchTokenRequest.append("redirect_uri", githubInfo.redirectUri);
                    fetchTokenRequest.append("state", request.param("state"));*/
                    const fetchTokenRequest = {
                        client_id: githubInfo.clientId,
                        client_secret: githubInfo.clientSecret,
                        code: code,
                        redirect_uri: githubInfo.redirectUri,
                        state: request.param("state")
                    };
                    fetch("https://github.com/login/oauth/access_token", {
                        method: "POST",
                        body: JSON.stringify(fetchTokenRequest),
                        headers: { 'Content-Type': 'application/json' }
                    }).then(async queryResponse => {
                        if (queryResponse.status == 200) {
                            const returnedParams = await queryResponse.text();
                            const accessTokenStart = returnedParams.indexOf("access_token=") + 13;
                            const accessToken = returnedParams.substr(accessTokenStart, returnedParams.indexOf("&", accessTokenStart) - accessTokenStart);
                            const credentials = new GitHubCredential(githubInfo, accessToken);
                            const user = await dbClient.getUserByUsername((request.query["state"] as string).split("-")[1]);
                            if (user) {
                                user.addIMSCredential(credentials);
                                await dbClient.save();
                            }
                            console.log(returnedParams);
                        } else {
                            console.error("Github returned an error: ", await queryResponse.text());
                        }
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