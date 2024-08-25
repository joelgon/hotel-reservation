import { customerBalanceCreateEntity, customerBalanceEntity } from "../entities/customer-balance.entity";

export interface ICustomerBalanceRepository {
    create(body: customerBalanceCreateEntity): Promise<customerBalanceEntity>;
}