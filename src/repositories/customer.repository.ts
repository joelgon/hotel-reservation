import { Types } from "mongoose";
import { Customer, CustomerModel } from "../model/customer.model";

export class CustomerRepository {
    async create(customerData: { name: string; email: string; password: string; }): Promise<Customer> {
        const customerModel = new CustomerModel(customerData);
        return (await customerModel.save()).toObject();
    }

    async findById(id: string): Promise<Customer | undefined> {
        const customerModel = await CustomerModel.findById(new Types.ObjectId(id)).exec();
        if (!customerModel) return undefined;
        
        return customerModel.toObject()
    }

    async findByEmail(email: string): Promise<Customer | undefined> {
        const customer = await CustomerModel.findOne({ email }).exec();
        if (!customer) return undefined;

        return customer.toObject();
    }
}