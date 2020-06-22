import { Component } from "../domain/components/Component";
import { IMSAdapter } from "./IMSAdapter";
import { IMSType } from "./IMSType";
import { DBClient } from "../domain/DBClient";
import { GitHubAdapter } from "./github/GitHubAdapter";

export async function getIMSAdapter(component: Component, dbClient: DBClient): Promise<IMSAdapter> {
    const imsType = (await component.getIMSInfo()).type;
    switch (imsType) {
        case IMSType.GitHub:
            return new GitHubAdapter(component, dbClient);
        default:
            throw new Error("There is no known ISM adapter for the given ims-type");
    }
}