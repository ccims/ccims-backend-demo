export interface IMSAdapter {
    createIssue(title: string, body: string): BigInt;
    modify(title: string, body: string): void;
}