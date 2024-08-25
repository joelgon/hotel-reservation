import { Logger } from "pino";
import { PreconditionFailed } from 'http-errors';
import { ICustomerRepository } from "../../domain/repositories/customer.repository";
import { customerCreateEntity } from "../../domain/entities/customer.entity";
import { ICustomerBalanceRepository } from "../../domain/repositories/customer-balance.repository";
import { IEncription } from "../../domain/cipher/encription";

export class SignUpUseCase {
    private readonly logger: Logger;
    private readonly customerRepository: ICustomerRepository;
    private readonly customerBalanceRepository: ICustomerBalanceRepository;
    private readonly encription: IEncription

    constructor(logger: Logger, customerRepository: ICustomerRepository, customerBalanceRepository: ICustomerBalanceRepository, encription: IEncription) {
        this.logger = logger;
        this.customerRepository = customerRepository;
        this.customerBalanceRepository = customerBalanceRepository;
        this.encription = encription;
    }

    async execute(body: customerCreateEntity) {
        const customerExists = await this.customerRepository.findByEmail(body.email);
        if (customerExists) {
            this.logger.warn(`Email "${body.email}" already registered`);
            throw new PreconditionFailed(`Email "${body.email}" already registered`);
        }

        body.password = await this.encription.execute(body.password);
        const customer = await this.customerRepository.create(body);

        await this.customerBalanceRepository.create({ customerId: customer._id.toString(), value: 0 });

        return { ...customer, password: undefined};
    }
}