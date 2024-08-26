import { Types } from "mongoose";
import { CustomerModel } from "../model/customer.model";

export class CustomerRepository {
    async create(customerData) {
        const customerModel = new CustomerModel(customerData);
        return (await customerModel.save()).toObject();
    }

    async findById(id: string) {
        const customerModel = await CustomerModel.findById(new Types.ObjectId(id)).exec();
        if (!customerModel) return undefined;
        
        return customerModel.toObject()
    }

    async findByEmail(email: string) {
        console.log('email', email)
        const customer = await CustomerModel.findOne({ email }).exec();
        console.log('customer', customer)
        if (!customer) return undefined;

        return customer.toObject();
    }
}