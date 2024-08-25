import { CustomerBalanceModel } from "../model/customer-balance.model";

export class CustomerBalanceRepository {
    async create(customerData) {
        const customerBalanceModel = new CustomerBalanceModel(customerData);
        return (await customerBalanceModel.save()).toObject();
    }
}