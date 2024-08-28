import { PreconditionFailed } from 'http-errors';
import { Logger } from 'pino';

import { logger } from '../common/utils/logger.util';
import { SignUpDto } from '../dtos/sign-up.dto';
import { AuthProvider } from '../providers/auth.provider';
import { EncriptionProvider } from '../providers/encription.provider';
import { CustomerBalanceRepository } from '../repositories/customer-balance.repository';
import { CustomerRepository } from '../repositories/customer.repository';

export class SignUpService {
  private readonly logger: Logger;
  private readonly customerRepository: CustomerRepository;
  private readonly customerBalanceRepository: CustomerBalanceRepository;
  private readonly encriptionProvider: EncriptionProvider;
  private readonly authProvider: AuthProvider;

  constructor() {
    this.logger = logger;
    this.customerRepository = new CustomerRepository();
    this.customerBalanceRepository = new CustomerBalanceRepository();
    this.encriptionProvider = new EncriptionProvider();
    this.authProvider = new AuthProvider();
  }

  async execute(body: SignUpDto) {
    const customerExists = await this.customerRepository.findByEmail(body.email);
    if (customerExists) {
      this.logger.warn(`Email "${body.email}" already registered`);
      throw new PreconditionFailed(`Email "${body.email}" already registered`);
    }

    body.password = await this.encriptionProvider.execute(body.password);
    const customer = await this.customerRepository.create(body);

    await this.customerBalanceRepository.create({ customerId: customer._id.toString(), value: 0 });

    const token = this.authProvider.sign(customer._id.toString());

    return { customer: { ...customer, password: undefined }, token };
  }
}
