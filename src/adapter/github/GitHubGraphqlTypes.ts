export interface IssueRequest {
    repository: {
        issues: {
            nodes: Array<{
                author: {
                    login: string;
                };
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
        }
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