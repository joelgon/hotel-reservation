import { Logger } from "pino";
import { PreconditionFailed } from 'http-errors';
import { CustomerRepository } from "../repositories/customer.repository";
import { CustomerBalanceRepository } from "../repositories/customer-balance.repository";
import { Encription } from "../utils/cipher/encription";
import { JsonWebToken } from "../utils/jwt";
import { logger } from "../utils/logger";
import { SignUpDto } from "../dtos/sign-up.dto";

export class SignUpService {
    private readonly logger: Logger;
    private readonly customerRepository: CustomerRepository;
    private readonly customerBalanceRepository: CustomerBalanceRepository;
    private readonly encription: Encription;
    private readonly jsonWebToken: JsonWebToken

    constructor() {
        this.logger = logger;
        this.customerRepository = new CustomerRepository();
        this.customerBalanceRepository = new CustomerBalanceRepository();
        this.encription = new Encription();
        this.jsonWebToken = new JsonWebToken();
    }

    async execute(body: SignUpDto) {
        const customerExists = await this.customerRepository.findByEmail(body.email);
        if (customerExists) {
            this.logger.warn(`Email "${body.email}" already registered`);
            throw new PreconditionFailed(`Email "${body.email}" already registered`);
        }

        body.password = await this.encription.execute(body.password);
        const customer = await this.customerRepository.create(body);

        await this.customerBalanceRepository.create({ customerId: customer._id.toString(), value: 0 });

        const token = this.jsonWebToken.sign(customer._id.toString());

        return { customer: { ...customer, password: undefined }, token };
    }
}