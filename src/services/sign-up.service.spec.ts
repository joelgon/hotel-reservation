import { PreconditionFailed } from 'http-errors';

import { SignUpService } from './sign-up.service';
import { logger } from '../common/utils/logger.util';
import { SignUpDto } from '../dtos/sign-up.dto';
import { AuthProvider } from '../providers/auth.provider';
import { EncriptionProvider } from '../providers/encription.provider';
import { CustomerBalanceRepository } from '../repositories/customer-balance.repository';
import { CustomerRepository } from '../repositories/customer.repository';

jest.mock('../repositories/customer.repository');
jest.mock('../repositories/customer-balance.repository');
jest.mock('../providers/encription.provider');
jest.mock('../providers/auth.provider');
jest.mock('../common/utils/logger.util');

describe('SignUpService', () => {
  let signUpService: SignUpService;
  let customerRepository: jest.Mocked<CustomerRepository>;
  let customerBalanceRepository: jest.Mocked<CustomerBalanceRepository>;
  let encriptionProvider: jest.Mocked<EncriptionProvider>;
  let authProvider: jest.Mocked<AuthProvider>;

  beforeEach(() => {
    signUpService = new SignUpService();
    customerRepository = CustomerRepository.prototype as jest.Mocked<CustomerRepository>;
    customerBalanceRepository = CustomerBalanceRepository.prototype as jest.Mocked<CustomerBalanceRepository>;
    encriptionProvider = EncriptionProvider.prototype as jest.Mocked<EncriptionProvider>;
    authProvider = AuthProvider.prototype as jest.Mocked<AuthProvider>;
  });

  it('should sign up successfully and return a token', async () => {
    const signUpDto: SignUpDto = { email: 'test@example.com', password: 'password123', name: 'John Doe' };
    const encryptedPassword = 'encryptedpassword';
    const customer = { _id: 'customer123', email: 'test@example.com', name: 'John Doe', password: encryptedPassword };
    const token = 'mocked-token';

    customerRepository.findByEmail.mockResolvedValue(<any>null);
    encriptionProvider.execute.mockResolvedValue(encryptedPassword);
    customerRepository.create.mockResolvedValue(<any>customer);
    customerBalanceRepository.create.mockResolvedValue(<any>true);
    authProvider.sign.mockReturnValue(token);

    const result = await signUpService.execute(signUpDto);

    expect(customerRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
    expect(encriptionProvider.execute).toHaveBeenCalledWith('password123');
    expect(customerRepository.create).toHaveBeenCalledWith({ ...signUpDto, password: encryptedPassword });
    expect(customerBalanceRepository.create).toHaveBeenCalledWith({ customerId: 'customer123', value: 0 });
    expect(authProvider.sign).toHaveBeenCalledWith('customer123');
    expect(result).toEqual({
      customer: { ...customer, password: undefined },
      token,
    });
  });

  it('should throw PreconditionFailed if email is already registered', async () => {
    const signUpDto: SignUpDto = { email: 'test@example.com', password: 'password123', name: 'John Doe' };
    const existingCustomer = { _id: 'customer123', email: 'test@example.com', name: 'John Doe', password: 'hashedpassword' };

    customerRepository.findByEmail.mockResolvedValue(<any>existingCustomer);

    await expect(signUpService.execute(signUpDto)).rejects.toThrow(PreconditionFailed);

    expect(customerRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
    expect(logger.warn).toHaveBeenCalledWith(`Email "${signUpDto.email}" already registered`);
  });
});
