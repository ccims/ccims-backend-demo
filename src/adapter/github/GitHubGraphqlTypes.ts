export interface IssueRequest {
    node: {
        body: string;
        closed: boolean;
        title: string;
        id: string;
        createdAt: string;
    }
}

export interface AllIssueRequest {
    node: {
        issues: {
            nodes: Array<{
                body: string;
                closed: boolean;
                title: string;
                id: string;
                createdAt: string;
            }>
        }
    }
}

export interface CreateIssueMutation {
    createIssue: {
        issue: {
            id: string
            createdAt: string;
            closed: boolean,
            interfaces: Array<string>
        }
    }
}

export interface ModifyIssueMutation {
    updateIssue: {
        clientMutationId: string
    }
}
export interface ReopenIssueMutation {
    reopenIssue: {
        clientMutationId: string
    }
}
export interface CloseIssueMutation {
    closeIssue: {
        clientMutationId: string
    }
}

export interface RemoveIssueMutation {
    deleteIssue: {
        clientMutationId: string;
    }
}

export interface CommentRequest {
    node: {
        comments: {
            nodes: Array<{
                author: {
                    login: string;
                };
                body: string;
                id: string;
                createdAt: string;
            }>
        }
    }
}

export interface RepositoryIdRequest {
    repository: {
        id: string
    }
}