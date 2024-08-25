import { Logger } from "pino";
import { PreconditionFailed } from 'http-errors';
import { ICustomerRepository } from "../../domain/repositories/customer.repository";
import { customerCreateEntity } from "../../domain/entities/customer.entity";
import { ICustomerBalanceRepository } from "../../domain/repositories/customer-balance.repository";

export class SignUpUseCase {
    private readonly logger: Logger;
    private readonly customerRepository: ICustomerRepository;
    private readonly customerBalanceRepository: ICustomerBalanceRepository;

    constructor(logger: Logger, customerRepository: ICustomerRepository, customerBalanceRepository: ICustomerBalanceRepository) {
        this.logger = logger;
        this.customerRepository = customerRepository;
        this.customerBalanceRepository = customerBalanceRepository;
    }

    async execute(body: customerCreateEntity) {
        const customerExists = await this.customerRepository.findByEmail(body.email);
        if (customerExists) {
            this.logger.warn(`Email "${body.email}" already registered`);
            throw new PreconditionFailed(`Email "${body.email}" already registered`);
        }

        
        const customer = await this.customerRepository.create(body);

        await this.customerBalanceRepository.create({ customerId: customer._id.toString(), value: 0 });

        return { ...customer, password: undefined};
    }
}