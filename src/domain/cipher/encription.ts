export interface IEncription {
    execute(password: string): Promise<string>;
}