export interface IssueRequest {
    node: {
        body: string;
        closed: boolean;
        title: string;
        id: string;
        createdAt: string;
    }
}

export interface CreateIssueMutation {
    createIssue: {
        issue: {
            id: string
            createdAt: string;
            closed: boolean;
        }
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