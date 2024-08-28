import { PreconditionFailed } from 'http-errors';

import { SignInService } from './sign-in.service';
import { SignInDto } from '../dtos/sign-in.dto';
import { AuthProvider } from '../providers/auth.provider';
import { CompareHashProvider } from '../providers/compare-hash.provider';
import { CustomerRepository } from '../repositories/customer.repository';

jest.mock('../repositories/customer.repository');
jest.mock('../providers/compare-hash.provider');
jest.mock('../providers/auth.provider');
jest.mock('../common/utils/logger.util');

describe('SignInService', () => {
  let signInService: SignInService;
  let customerRepository: jest.Mocked<CustomerRepository>;
  let compareHashProvider: jest.Mocked<CompareHashProvider>;
  let authProvider: jest.Mocked<AuthProvider>;

  beforeEach(() => {
    signInService = new SignInService();
    customerRepository = CustomerRepository.prototype as jest.Mocked<CustomerRepository>;
    compareHashProvider = CompareHashProvider.prototype as jest.Mocked<CompareHashProvider>;
    authProvider = AuthProvider.prototype as jest.Mocked<AuthProvider>;
  });

  it('should sign in successfully and return a token', async () => {
    const signInDto: SignInDto = { email: 'test@example.com', password: 'password123' };
    const customer = { _id: 'customer123', email: 'test@example.com', password: 'hashedpassword' };
    const token = 'mocked-token';

    customerRepository.findByEmail.mockResolvedValue(<any>customer);
    compareHashProvider.execute.mockResolvedValue(true);
    authProvider.sign.mockReturnValue(token);

    const result = await signInService.execute(signInDto);

    expect(customerRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
    expect(compareHashProvider.execute).toHaveBeenCalledWith('password123', 'hashedpassword');
    expect(authProvider.sign).toHaveBeenCalledWith('customer123');
    expect(result).toEqual({
      customer: { ...customer, password: undefined },
      token,
    });
  });

  it('should throw PreconditionFailed if customer is not found', async () => {
    const signInDto: SignInDto = { email: 'test@example.com', password: 'password123' };

    customerRepository.findByEmail.mockResolvedValue(<any>null);

    await expect(signInService.execute(signInDto)).rejects.toThrow(PreconditionFailed);

    expect(customerRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
  });

  it('should throw PreconditionFailed if password is incorrect', async () => {
    const signInDto: SignInDto = { email: 'test@example.com', password: 'password123' };
    const customer = { _id: 'customer123', email: 'test@example.com', password: 'hashedpassword' };

    customerRepository.findByEmail.mockResolvedValue(<any>customer);
    compareHashProvider.execute.mockResolvedValue(false);

    await expect(signInService.execute(signInDto)).rejects.toThrow(PreconditionFailed);

    expect(compareHashProvider.execute).toHaveBeenCalledWith('password123', 'hashedpassword');
  });
});
