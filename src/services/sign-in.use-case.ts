import { Logger } from "pino";
import { PreconditionFailed } from 'http-errors'
import { ICustomerRepository } from "../../domain/repositories/customer.repository";
import { IJsonWebToken } from "../../domain/jwt";
import { ICompareHash } from "../../domain/cipher/compare-hash";
import { customerCreateEntity } from "../../domain/entities/customer.entity";

export class SignInUseCase {
    private readonly logger: Logger;
    private readonly customerRepository: ICustomerRepository
    private readonly compareHash: ICompareHash
    private readonly jsonWebToken: IJsonWebToken

    constructor(
        logger: Logger,
        customerRepository: ICustomerRepository,
        compareHash: ICompareHash,
        jsonWebToken: IJsonWebToken
    ) {
        this.logger = logger;
        this.customerRepository = customerRepository;
        this.compareHash = compareHash;
        this.jsonWebToken = jsonWebToken;
    }

    async execute({ email, password }: Omit<customerCreateEntity, 'name'>) {
        const customer = await this.customerRepository.findByEmail(email);
        if (!customer) throw new PreconditionFailed(`Incorrect username or password`);

        const isCorrectPassword = await this.compareHash.execute(password, customer.password);
        if (!isCorrectPassword) throw new PreconditionFailed(`Incorrect username or password`);

        const token = await this.jsonWebToken.sign(customer._id.toString());

        return { customer: { ...customer, password: undefined }, token }
    }
}