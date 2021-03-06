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
import { IMSAdapter } from "../../adapter/IMSAdapter";
import { IMSResolver } from "./IMSResolver";
import { IMSType } from "../../adapter/IMSType";
import { GitHubIMSInfo } from "../../adapter/github/GitHubIMSInfo";
import { IMSInfo } from "../../adapter/IMSInfo";

export class RootApiResolver {

    private readonly dbClient: DBClient;
    private readonly _user: User;

    constructor(user: User, dbClient: DBClient) {
        this.dbClient = dbClient;
        this._user = user;
    }

    async component(args: GetElementArgs): Promise<ComponentResolver> {
        return new ComponentResolver(await this.dbClient.getComponent(args.id), this._user, this.dbClient);
    }

    async ims(args: GetElementArgs): Promise<IMSResolver> {
        const imsInfo = await this.dbClient.getIMSInfo(args.id);
        return IMSResolver.getIMSResolver(imsInfo, this.dbClient);
    }

    async interface(args: GetElementArgs): Promise<InterfaceResolver> {
        return new InterfaceResolver(await this.dbClient.getComponentInterface(args.id), this._user, this.dbClient);
    }

    async issue(args: GetIssueArgs): Promise<IssueResolver> {
        const component = await this.dbClient.getComponent(args.componentId);
        const issue = await Issue.load(args.issueId, component, this._user, this.dbClient);
        return new IssueResolver(issue, this._user, this.dbClient);
    }

    async project(args: GetElementArgs): Promise<ProjectResolver> {
        return new ProjectResolver(await this.dbClient.getProject(args.id), this._user, this.dbClient);
    }

    public async user(args: GetElementArgs): Promise<UserResolver> {
        return new UserResolver(await this.dbClient.getUser(args.id), this.dbClient);
    }

    public async userByUsername(getUserArgs: GetUserArgs): Promise<UserResolver | null> {
        if (getUserArgs.username) {
            const user = await this.dbClient.getUserByUsername(getUserArgs.username);
            if (user) {
                return new UserResolver(user, this.dbClient);
            }
        }
        return null;
    }

    async projects(): Promise<Array<ProjectResolver>> {
        return (await this.dbClient.getAllProjects()).map(project => new ProjectResolver(project, this._user, this.dbClient));
    }

    //###################Mutations

    async createIssue(args: CreateIssueArgs): Promise<IssueResolver> {
        if (!args.data.componentId) {
            throw new Error("componentID is necessary");
        }
        const componentInterfaces = (await Promise.all((args.data.interfaceIds || []).map(id => this.dbClient.getComponentInterface(id)))).filter(compInterface => compInterface.hostComponentId == args.data.componentId).map(iface => iface.id);
        const component = await this.dbClient.getComponent(args.data.componentId);
        return new IssueResolver(await Issue.create(component, this._user, args.data.title || "untiteled ccims issue", args.data.body || "", args.data.issueType || IssueType.UNCLASSIFIED, componentInterfaces, this.dbClient), this._user, this.dbClient);
    }

    async updateIssue(args: UpdateIssueArgs): Promise<IssueResolver> {
        const issue = await Issue.load(args.issueId, await this.dbClient.getComponent(args.componentId), this._user, this.dbClient);
        if (args.data.body) {
            issue.body = args.data.body;
        }
        if (args.data.title) {
            issue.title = args.data.title;
        }
        if (args.data.componentId) {
            //throw new Error("The component id can't be changed");
        }
        if (args.data.issueType) {
            issue.type = args.data.issueType;
        }
        if (typeof args.data.opened === "boolean") {
            issue.open = args.data.opened;
        }
        if (typeof args.data.interfaceIds === "object" && args.data.interfaceIds instanceof Array) {
            const componentInterfaces = (await Promise.all((args.data.interfaceIds || []).map(id => this.dbClient.getComponentInterface(id)))).filter(compInterface => compInterface.hostComponentId == args.data.componentId).map(iface => iface.id);
            issue.setComponentInterfaces(componentInterfaces);
        }
        issue.saveToIMS(this._user, this.dbClient);
        return new IssueResolver(issue, this._user, this.dbClient);
    }

    async addIssueRelation(args: AddIssueRelationArgs): Promise<IssueRelationResolver> {
        const issue = await Issue.load(args.data.fromId, await this.dbClient.getComponent(args.data.fromComponentId), this._user, this.dbClient);
        const retVal = new IssueRelationResolver(await issue.addIssueRelation(args.data.type || IssueRelationType.RELATED_TO, args.data.fromId, args.data.fromComponentId, args.data.toId, args.data.toComponentId, this.dbClient), this._user, this.dbClient);
        issue.saveToIMS(this._user, this.dbClient);
        return retVal;
    }

    async removeIssueRelation(args: RemoveIssueRelationArgs): Promise<boolean> {
        const issue = await Issue.load(args.fromId, await this.dbClient.getComponent(args.fromComponentId), this._user, this.dbClient);
        const retVal = issue.removeIssueRelation(args.fromId, args.fromComponentId, args.toId);
        issue.saveToIMS(this._user, this.dbClient);
        return retVal;
    }

    async removeIssue(args: RemoveIssueArgs): Promise<boolean> {
        const issue = Issue.load(args.issueId, await this.dbClient.getComponent(args.componentId), this._user, this.dbClient)
        return (await issue).remove(this._user, this.dbClient);
    }

    async createProject(args: CreateProjectArgs): Promise<ProjectResolver> {
        const user = await this.dbClient.getUserByUsername(args.data.ownerUsername);
        const project = await this.dbClient.createProject(args.data.name, args.data.description || "", user);
        await this.dbClient.save();
        return new ProjectResolver(project, this._user, this.dbClient);
    }

    async modifyProject(args: ModifyProjectArgs): Promise<ProjectResolver> {
        const project = await this.dbClient.getProject(args.projectId);
        if (args.data.description) {
            project.description = args.data.description
        }
        project.name = args.data.name;
        await this.dbClient.save();
        return new ProjectResolver(project, this._user, this.dbClient);
    }

    async addComponentToProject(args: AddComponentToProjectArgs): Promise<ProjectResolver> {
        const project = await this.dbClient.getProject(args.projectId);
        const component = await this.dbClient.getComponent(args.componentId);
        project.addComponent(component);
        await this.dbClient.save();
        return new ProjectResolver(project, this._user, this.dbClient);
    }

    removeComponentFromProject(args: RemoveComponentFromProjectArgs): ProjectResolver | null {
        // TODO: Implement
        return null;
    }

    removeProject(args: RemoveProjectArgs): boolean {
        // TODO: Implement
        return false;
    }

    async createComponent(args: CreateComponentArgs): Promise<ComponentResolver> {
        const owner = await this.dbClient.getUserByUsername(args.data.ownerUsername);
        const imsInfo = await this.dbClient.getIMSInfo(args.data.imsId);
        const imsData = IMSDataFactory.toValidIMDData(args.data.imsData, imsInfo);
        const component = await this.dbClient.createComponent(args.data.name, args.data.description || "", new Set<Project>(), imsInfo, owner, imsData);
        await this.dbClient.save();
        return new ComponentResolver(component, this._user, this.dbClient);
    }

    async addUsedInterface(args: AddRemoveProvidedUsedInterfaceArgs): Promise<ComponentResolver> {
        const componentInterface = await this.dbClient.getComponentInterface(args.interfaceId);
        const usingComponent = await this.dbClient.getComponent(args.componentId);
        usingComponent.addConsumedComponentInterface(componentInterface);
        await this.dbClient.save();
        return new ComponentResolver(usingComponent, this._user, this.dbClient);
    }

    async removeUsedInterface(args: AddRemoveProvidedUsedInterfaceArgs): Promise<ComponentResolver> {
        const componentInterface = await this.dbClient.getComponentInterface(args.interfaceId);
        const usingComponent = await this.dbClient.getComponent(args.componentId);
        usingComponent.removeConsumedComponentInterface(componentInterface);
        await this.dbClient.save();
        return new ComponentResolver(usingComponent, this._user, this.dbClient);
    }

    removeComponent(args: RemoveComponentArgs): boolean {
        // TODO: Implement
        return false;
    }

    async createInterface(args: AddInterfaceArgs): Promise<InterfaceResolver> {
        const component = await this.dbClient.getComponent(args.data.hostComponentId)
        const componentInterface = await this.dbClient.createComponentInterface(args.data.name, component);
        await this.dbClient.save();
        return new InterfaceResolver(componentInterface, this._user, this.dbClient);
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
    interfaceIds?: string[]
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

interface GetElementArgs {
    id: string
}

interface GetIssueArgs {
    issueId: string
    componentId: string
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