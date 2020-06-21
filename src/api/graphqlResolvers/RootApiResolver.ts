import { IssueResolver } from "./IssueResolver";
import { UserResolver } from "./UserResolver";
import { User } from "../../domain/users/User";
import { DBClient } from "../../domain/DBClient";
import { ProjectResolver } from "./ProjectResolver";
import { Project } from "../../domain/components/Project";
import { GithubAdapter } from "../../adapter/github/GitHubAdapter";

export class RootApiResolver {

    private readonly dbClient: DBClient;

    constructor(dbClient: DBClient) {
        this.dbClient = dbClient;
    }

    public async user(getUserArgs: GetUserArgs): Promise<UserResolver | null> {
        if (getUserArgs.username) {
            const user = await this.dbClient.getUserByUsername(getUserArgs.username);
            if (user) {
                return new UserResolver(user, this.dbClient);
            }
        }
        return null;
    }

    issue(getIssueArgs: GetIssueArgs): IssueResolver | null {
        return null;
    }

    projects(): Array<ProjectResolver | null> {
        return [null];
    }

    //###################Mutations

    createIssue(data: IssueInput!): IssueResolver {

    }

    updateIssue(issueId: ID!, data: IssueInput!): IssueResolver {

    }

    removeIssue(issueId: ID!): boolean {

    }

    createProject(data: ProjectInput!): ProjectResolver {

    }

    modifyProject(projectId: ID!, data: ProjectInput): ProjectResolver {

    }

    addComponentToProject(projectId: ID!, componentId: ID!): ProjectResolver {

    }

    removeComponentFromProject(projectId: ID!, componentId: ID!): ProjectResolver {

    }

    removeProject(projectId: ID!): boolean {

    }

    createComponent(data: ComponentInput): Component {

    }

    removeComponent(componentId: ID!): Boolean {

    }


    createUser(data: UserInput!): User {

    }

}

interface IssueInput {
    title?: string
    body?: string
    opened?: boolean
}
interface UserInput {
    userName: string
    password?: string
}
interface ComponentInput {
    name: string
    description?: string
    imsId: string
    ownerUserName: string
}
enum ImsType {
    GitHub
}
interface ProjectInput {
    name: String
    description?: String
    ownerUsername: String
}

interface GetUserArgs {
    username: string
}

interface GetIssueArgs {
    issueId: string
}

interface CreateIssueArgs {
    data: IssueInput
}
interface UpdateIssueArgs {
    issueId: string,
    data: IssueInput
}
interface RemoveIssueArgs {
    id: string
}
interface CreateProjectArgs {
    data: ProjectInput
}
interface ModifyProjectArgs {
    projectId: string
}
interface AddComponentToProjectArgs {
    projectId: string,
    componentId: string
}
interface RemoveComponentFromProjectArgs {
    projectId: string,
    componentId: string
}
interface RemoveProjectArgs {
    projectId: string
}
interface CreateComponentArgs {

}