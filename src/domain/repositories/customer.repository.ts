import { customerCreateEntity, customerEntity } from "../entities/customer.entity";

export interface ICustomerRepository {
    create(body: customerCreateEntity): Promise<customerEntity>;
    findByEmail(email: string): Promise<customerEntity | undefined>;
    findById(id: string): Promise<customerEntity | undefined>;
}