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
import { IMSDataFactory } from "../../adapter/IMSDataFactory";
import { IssueType } from "../../domain/issues/IssueType";
import { IssueRelation, IssueRelationType } from "../../domain/issues/IssueRelation";
import { IssueRelationResolver } from "./IssueRelationResolver";
import { ComponentInterface } from "../../domain/components/ComponentInterface";

export class RootApiResolver {

    private readonly dbClient: DBClient;
    private readonly _user: User;

    constructor(user: User, dbClient: DBClient) {
        this.dbClient = dbClient;
        this._user = user;
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

    async projects(): Promise<Array<ProjectResolver>> {
        return (await this.dbClient.getAllProjects()).map(project => new ProjectResolver(project, this.dbClient));
    }

    //###################Mutations

    async createIssue(args: CreateIssueArgs): Promise<IssueResolver> {
        const component = await Component.load(this.dbClient, BigInt(args.data.componentId));
        return new IssueResolver(await Issue.create(component, this._user, args.data.title || "untiteled ccims issue", args.data.body || "", args.data.issueType || IssueType.UNCLASSIFIED, this.dbClient), this._user, this.dbClient);
    }

    async updateIssue(args: UpdateIssueArgs): Promise<IssueResolver | null> {
        const issue = await Issue.load(args.issueId, await Component.load(this.dbClient, BigInt(args.componentId)), this._user, this.dbClient);
        if (args.data.body) {
            issue.body = args.data.body;
        }
        if (args.data.title) {
            issue.title = args.data.title;
        }
        if (args.data.componentId) {
            throw new Error("The component id can't be changed");
        }
        if (args.data.issueType) {
            issue.type = args.data.issueType;
        }
        if (typeof args.data.opened === "boolean") {
            issue.open = args.data.opened;
        }
        issue.saveToIMS(this._user, this.dbClient);
        return new IssueResolver(issue, this._user, this.dbClient);
    }

    async addIssueRelation(args: AddIssueRelationArgs): Promise<IssueRelationResolver> {
        const issue = await Issue.load(args.data.fromId, await Component.load(this.dbClient, BigInt(args.data.fromComponentId)), this._user, this.dbClient);
        const retVal = new IssueRelationResolver(await issue.addIssueRelation(args.data.type || IssueRelationType.RELATED_TO, args.data.fromId, BigInt(args.data.fromComponentId), args.data.toId, BigInt(args.data.toComponentId), this.dbClient), this._user, this.dbClient);
        issue.saveToIMS(this._user, this.dbClient);
        return retVal;
    }

    async removeIssueRelation(args: RemoveIssueRelationArgs): Promise<boolean> {
        const issue = await Issue.load(args.fromId, await Component.load(this.dbClient, BigInt(args.fromComponentId)), this._user, this.dbClient);
        const retVal = issue.removeIssueRelation(args.fromId, BigInt(args.fromComponentId), args.toId);
        issue.saveToIMS(this._user, this.dbClient);
        return retVal;
    }

    async removeIssue(args: RemoveIssueArgs): Promise<boolean> {
        const issue = Issue.load(args.issueId, await Component.load(this.dbClient, BigInt(args.componentId)), this._user, this.dbClient)
        return (await issue).remove(this._user, this.dbClient);
    }

    async createProject(args: CreateProjectArgs): Promise<ProjectResolver> {
        const user = await this.dbClient.getUserByUsername(args.data.ownerUsername);
        const project = await Project.create(this.dbClient, args.data.name, args.data.description || "", user);
        this.dbClient.save();
        return new ProjectResolver(project, this.dbClient);
    }

    async modifyProject(args: ModifyProjectArgs): Promise<ProjectResolver> {
        const project = await Project.load(this.dbClient, BigInt(args.projectId));
        if (args.data.description) {
            project.description = args.data.description
        }
        project.name = args.data.name;
        this.dbClient.save();
        return new ProjectResolver(project, this.dbClient);
    }

    async addComponentToProject(args: AddComponentToProjectArgs): Promise<ProjectResolver> {
        const project = await Project.load(this.dbClient, BigInt(args.projectId));
        const component = await Component.load(this.dbClient, BigInt(args.componentId));
        project.addComponent(component);
        this.dbClient.save();
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

    async createComponent(args: CreateComponentArgs): Promise<ComponentResolver | null> {
        const owner = await this.dbClient.getUserByUsername(args.data.ownerUsername);
        const imsInfo = await this.dbClient.getIMSInfo(BigInt(args.data.imsId));
        const imsData = IMSDataFactory.toValidIMDData(args.data.imsData, imsInfo);
        const component = await Component.create(this.dbClient, args.data.name, args.data.description || "", new Set<Project>(), imsInfo, owner, imsData);
        this.dbClient.save();
        return new ComponentResolver(component, this.dbClient);
    }

    async addUsedInterface(args: AddRemoveProvidedUsedInterfaceArgs): Promise<ComponentResolver> {
        const componentInterface = await ComponentInterface.load(this.dbClient, BigInt(args.interfaceId));
        const usingComponent = await Component.load(this.dbClient, BigInt(args.componentId));
        usingComponent.addConsumedComponentInterface(componentInterface);
        this.dbClient.save();
        return new ComponentResolver(usingComponent, this.dbClient);
    }

    async removeUsedInterface(args: AddRemoveProvidedUsedInterfaceArgs): Promise<ComponentResolver> {
        const componentInterface = await ComponentInterface.load(this.dbClient, BigInt(args.interfaceId));
        const usingComponent = await Component.load(this.dbClient, BigInt(args.componentId));
        usingComponent.removeConsumedComponentInterface(componentInterface);
        this.dbClient.save();
        return new ComponentResolver(usingComponent, this.dbClient);
    }

    removeComponent(args: RemoveComponentArgs): boolean {
        // TODO: Implement
        return false;
    }

    async createInterface(args: AddInterfaceArgs): Promise<InterfaceResolver> {
        const component = await Component.load(this.dbClient, BigInt(args.data.hostComponentId))
        const componentInterface = await ComponentInterface.create(this.dbClient, args.data.name, component);
        this.dbClient.save();
        return new InterfaceResolver(componentInterface, this.dbClient);
    }

    removeInterface(args: RemoveInterfaceArgs): boolean {
        // TODO: Implement
        return false;
    }

}

interface IssueInput {
    title?: string
    body?: string
    opened?: boolean
    componentId?: string
    issueType?: IssueType
}
interface UserInput {
    userName: string
    password?: string
}
interface ComponentInput {
    name: string
    description?: string
    imsId: string
    ownerUsername: string
    imsData: ImsDataInput
}
interface ImsDataInput {
    repository?: string,
    owner?: string
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
    hostComponentId: string
}
interface AddIssueRelationInput {
    fromId: string,
    fromComponentId: string,
    toId: string,
    toComponentId: string,
    type?: IssueRelationType
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
    data: IssueInput,
    componentId: string
}
interface RemoveIssueRelationArgs {
    fromId: string,
    toId: string,
    fromComponentId: string
}
interface AddIssueRelationArgs {
    data: AddIssueRelationInput
}
interface RemoveIssueArgs {
    issueId: string
    componentId: string
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
interface RemoveInterfaceArgs {
    interfaceId: string
}