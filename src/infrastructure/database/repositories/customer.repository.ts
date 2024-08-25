import { CustomerModel } from "../model/customer.model";

export class CustomerRepository {
    async create(customerData) {
        const customerModel = new CustomerModel(customerData);
        return (await customerModel.save()).toObject();
    }

    async findById(id: string) {
        return await CustomerModel.findById(id).exec();
    }

    async findByEmail(email: string) {
        const customer = await CustomerModel.findOne({ email }).exec();
        if(!customer) return undefined;

        return customer.toObject();
    }
}