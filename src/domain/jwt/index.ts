export interface IJsonWebToken {
    sign(customerId: string): string;
    verify(token: string): { customerId: string };
}