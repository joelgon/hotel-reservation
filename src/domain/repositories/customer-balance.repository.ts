import { ClientSession } from "mongoose";
import { customerBalanceCreateEntity, customerBalanceEntity } from "../entities/customer-balance.entity";

export interface ICustomerBalanceRepository {
    create(body: customerBalanceCreateEntity): Promise<customerBalanceEntity>;
    findByIdAndLock(customerId: string, session?: ClientSession): Promise<customerBalanceEntity | undefined>;
    updateAndUnLock({ customerId, value }: { customerId: string, value: number }, session?: ClientSession): Promise<boolean>;
}