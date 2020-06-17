import { Router } from "express";

export let tokenResponseRouter = Router();

tokenResponseRouter.use("/github", (request, response, next) => {
    console.log("Token response from github: ", request);
});