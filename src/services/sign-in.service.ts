import { Logger } from "pino";
import { PreconditionFailed } from 'http-errors';
import { CustomerRepository } from "../repositories/customer.repository";
import { CompareHashProvider } from "../providers/compare-hash.provider";
import { AuthProvider } from "../providers/auth.provider";
import { logger } from "../utils/logger.util";
import { SignInDto } from "../dtos/sign-in.dto";

export class SignInService {
    private readonly logger: Logger;
    private readonly customerRepository: CustomerRepository;
    private readonly compareHashProvider: CompareHashProvider;
    private readonly authProvider: AuthProvider;

    constructor() {
        this.logger = logger;
        this.customerRepository = new CustomerRepository();
        this.compareHashProvider = new CompareHashProvider();
        this.authProvider = new AuthProvider();
    }

    async execute({ email, password }: SignInDto) {
        const customer = await this.customerRepository.findByEmail(email);
        if (!customer) throw new PreconditionFailed(`Incorrect username or password`);

        const isCorrectPassword = await this.compareHashProvider.execute(password, customer.password);
        if (!isCorrectPassword) throw new PreconditionFailed(`Incorrect username or password`);

        const token = this.authProvider.sign(customer._id.toString());

        return { customer: { ...customer, password: undefined }, token }
    }
}