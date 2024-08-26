export interface ICompareHash {
    execute(password: string, passwordHash: string): Promise<boolean>;
}