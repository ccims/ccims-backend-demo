import { IssueResolver } from "./IssueResolver";
import { UserResolver } from "./UserResolver";
import { User } from "../../domain/users/User";
import { DBClient } from "../../domain/DBClient";
import { ProjectResolver } from "./ProjectResolver";
import { Project } from "../../domain/components/Project";
import { GitHubAdapter } from "../../adapter/github/GitHubAdapter";
import { ComponentResolver } from "./ComponentResolver";
import { InterfaceResolver } from "./InterfaceResolver";
import { Issue } from "../../domain/issues/Issue";
import { Component } from "../../domain/components/Component";

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

    createIssue(args: CreateIssueArgs): IssueResolver | null {
        // TODO: Implement
        return null;
    }

    updateIssue(args: UpdateIssueArgs): IssueResolver | null {
        // TODO: Implement
        return null;
    }

    addIssueRelation(args: AddRemoveIssueRelationArgs): boolean {
        // TODO: Implement
        return false;
    }

    removeIssueRelation(args: AddRemoveIssueRelationArgs): boolean {
        // TODO: Implement
        return false;
    }

    removeIssue(args: RemoveIssueArgs): boolean {
        // TODO: Implement
        return false;
    }

    async createProject(args: CreateProjectArgs): Promise<ProjectResolver> {
        const user = await this.dbClient.getUserByUsername(args.data.ownerUsername);
        const project = await Project.create(this.dbClient, args.data.name, args.data.description || "", user);
        project.saveToDB();
        return new ProjectResolver(project, this.dbClient);
    }

    async modifyProject(args: ModifyProjectArgs): Promise<ProjectResolver> {
        const project = await Project.load(this.dbClient, BigInt(args.projectId));
        if (args.data.description) {
            project.description = args.data.description
        }
        project.name = args.data.name;
        return new ProjectResolver(project, this.dbClient);
    }

    async addComponentToProject(args: AddComponentToProjectArgs): Promise<ProjectResolver> {
        const project = await Project.load(this.dbClient, BigInt(args.projectId));
        const component = await Component.load(this.dbClient, BigInt(args.componentId));
        project.addComponent(component);
        return new ProjectResolver(project, this.dbClient);
    }

    removeComponentFromProject(args: RemoveComponentFromProjectArgs): ProjectResolver | null {
        // TODO: Implement
        return null;
    }

    removeProject(args: RemoveProjectArgs): boolean {
        // TODO: Implement
        return false;
    }

    createComponent(args: CreateProjectArgs): ComponentResolver | null {
        // TODO: Implement
        return null;
    }

    addProvidedInterface(args: AddRemoveProvidedUsedInterfaceArgs): ComponentResolver | null {
        // TODO: Implement
        return null;
    }

    removeProvidedInterface(args: AddRemoveProvidedUsedInterfaceArgs): ComponentResolver | null {
        // TODO: Implement
        return null;
    }

    addUsedInterface(args: AddRemoveProvidedUsedInterfaceArgs): ComponentResolver | null {
        // TODO: Implement
        return null;
    }

    removeUsedInterface(args: AddRemoveProvidedUsedInterfaceArgs): ComponentResolver | null {
        // TODO: Implement
        return null;
    }

    removeComponent(args: RemoveComponentArgs): boolean {
        // TODO: Implement
        return false;
    }

    addInterface(args: AddInterfaceArgs): InterfaceResolver | null {
        // TODO: Implement
        return null;
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
    name: string
    description?: string
    ownerUsername: string
}
interface InterfaceInput {
    name: string
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
interface AddRemoveIssueRelationArgs {
    fromId: string,
    toId: string
}
interface RemoveIssueArgs {
    id: string
}
interface CreateProjectArgs {
    data: ProjectInput
}
interface ModifyProjectArgs {
    projectId: string
    data: ProjectInput
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
    data: ComponentInput
}
interface AddRemoveProvidedUsedInterfaceArgs {
    componentId: string,
    interfaceId: string
}
interface RemoveComponentArgs {
    componentId: string
}
interface AddInterfaceArgs {
    data: InterfaceInput
}