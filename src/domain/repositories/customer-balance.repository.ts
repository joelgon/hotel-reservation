import { ClientSession } from "mongoose";
import { customerBalanceCreateEntity, customerBalanceEntity } from "../entities/customer-balance.entity";

export interface ICustomerBalanceRepository {
    create(body: customerBalanceCreateEntity): Promise<customerBalanceEntity>;
    findOne(customerId: string, session?: ClientSession): Promise<customerBalanceEntity | undefined>;
    update({ customerId, value }: { customerId: string, value: number }, session?: ClientSession): Promise<boolean>;
}