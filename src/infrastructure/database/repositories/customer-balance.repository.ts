import { ClientSession } from "mongoose";
import { CustomerBalanceModel } from "../model/customer-balance.model";

export class CustomerBalanceRepository {
    async create(customerData) {
        const customerBalanceModel = new CustomerBalanceModel(customerData);
        return (await customerBalanceModel.save()).toObject();
    }

    async findByIdAndLock(customerId: string, session?: ClientSession) {
        const customerBalanceModel = await CustomerBalanceModel.findOneAndUpdate({ customerId, lock: false }, { lock: true }, { session });

        if (!customerBalanceModel) return undefined;

        return customerBalanceModel.toObject();
    }

    async updateAndUnLock({ customerId, value }: { customerId: string, value: number }, session?: ClientSession): Promise<boolean> {
        const { matchedCount, modifiedCount } = await CustomerBalanceModel.updateOne({ customerId, lock: true }, { value, lock: false }, { session });

        return matchedCount > 0 && modifiedCount > 0;
    }
}