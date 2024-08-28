import { ClientSession } from "mongoose";
import { CustomerBalance, CustomerBalanceModel } from "../model/customer-balance.model";

export class CustomerBalanceRepository {
    async create(customerData: { customerId: string; value: number; }): Promise<CustomerBalance> {
        const customerBalanceModel = new CustomerBalanceModel(customerData);
        return (await customerBalanceModel.save()).toObject();
    }

    async findOne(customerId: string, session?: ClientSession): Promise<CustomerBalance | undefined> {
        const customerBalanceModel = await CustomerBalanceModel.findOne({ customerId }, undefined, { session });

        if (!customerBalanceModel) return undefined;

        return customerBalanceModel.toObject();
    }

    async update({ customerId, value }: { customerId: string, value: number }, session?: ClientSession): Promise<boolean> {
        const { matchedCount, modifiedCount } = await CustomerBalanceModel.updateOne({ customerId }, { value }, { session });

        return matchedCount >= 1 && modifiedCount >= 1;
    }
}