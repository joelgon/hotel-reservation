import { Logger } from "pino";
import { PreconditionFailed } from 'http-errors';
import { CustomerRepository } from "../repositories/customer.repository";
import { CompareHash } from "../utils/cipher/compare-hash";
import { JsonWebToken } from "../utils/jwt";
import { logger } from "../utils/logger";
import { SignInDto } from "../dtos/sign-in.dto";

export class SignInService {
    private readonly logger: Logger;
    private readonly customerRepository: CustomerRepository;
    private readonly compareHash: CompareHash;
    private readonly jsonWebToken: JsonWebToken;

    constructor() {
        this.logger = logger;
        this.customerRepository = new CustomerRepository();
        this.compareHash = new CompareHash();
        this.jsonWebToken = new JsonWebToken();
    }

    async execute({ email, password }: SignInDto) {
        const customer = await this.customerRepository.findByEmail(email);
        if (!customer) throw new PreconditionFailed(`Incorrect username or password`);

        const isCorrectPassword = await this.compareHash.execute(password, customer.password);
        if (!isCorrectPassword) throw new PreconditionFailed(`Incorrect username or password`);

        const token = this.jsonWebToken.sign(customer._id.toString());

        return { customer: { ...customer, password: undefined }, token }
    }
}