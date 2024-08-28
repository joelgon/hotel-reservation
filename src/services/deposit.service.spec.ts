import { PreconditionFailed } from 'http-errors';
import { ClientSession } from 'mongoose';

import { DepositService } from './deposit.service';
import { logger } from '../common/utils/logger.util';
import { CustomerBalanceRepository } from '../repositories/customer-balance.repository';
import { ExtractRepository } from '../repositories/extract.repository';
import { LockItemRepository } from '../repositories/lock-item.repository';

jest.mock('../repositories/customer-balance.repository');
jest.mock('../repositories/extract.repository');
jest.mock('../repositories/lock-item.repository');
jest.mock('../common/utils/logger.util');
jest.mock('../common/decorator/transaction.decorator', () => ({
  Transaction:
    () =>
    (...args: [unknown, unknown, PropertyDescriptor]) => {
      return args[2];
    },
}));

describe('DepositService', () => {
  let depositService: DepositService;
  let customerBalanceRepository: jest.Mocked<CustomerBalanceRepository>;
  let extractRepository: jest.Mocked<ExtractRepository>;
  let lockItemRepository: jest.Mocked<LockItemRepository>;

  beforeEach(() => {
    depositService = new DepositService();
    customerBalanceRepository = CustomerBalanceRepository.prototype as jest.Mocked<CustomerBalanceRepository>;
    extractRepository = ExtractRepository.prototype as jest.Mocked<ExtractRepository>;
    lockItemRepository = LockItemRepository.prototype as jest.Mocked<LockItemRepository>;
  });

  it('should successfully complete the deposit', async () => {
    const oldCustomerBalance = { _id: '1', customerId: '123', value: 1000 };
    const value = 500;
    const session = {} as ClientSession;

    lockItemRepository.create.mockResolvedValue(<any>true);
    customerBalanceRepository.findOne.mockResolvedValue(<any>{ customerId: '123', value: 1000 });
    extractRepository.create.mockResolvedValue(<any>true);
    customerBalanceRepository.update.mockResolvedValue(true);

    await depositService.execute(oldCustomerBalance, value, session);

    expect(lockItemRepository.create).toHaveBeenCalledWith('1');
    expect(customerBalanceRepository.findOne).toHaveBeenCalledWith('123');
    expect(extractRepository.create).toHaveBeenCalledWith({ customerId: '123', description: 'Aporte Realizado', value }, session);
    expect(customerBalanceRepository.update).toHaveBeenCalledWith({ customerId: '123', value: 1500 }, session);
    expect(lockItemRepository.delete).toHaveBeenCalledWith('1');
    expect(logger.info).toHaveBeenCalledWith({ value, oldCustomerBalance }, 'Deposit Strat');
    expect(logger.info).toHaveBeenCalledWith({ customerId: '123', value: 1500 }, 'Deposit success');
  });

  it('should throw PreconditionFailed if lockItem creation fails', async () => {
    const oldCustomerBalance = { _id: '1', customerId: '123', value: 1000 };
    const value = 500;
    const session = {} as ClientSession;

    lockItemRepository.create.mockResolvedValue(<any>null);

    await expect(depositService.execute(oldCustomerBalance, value, session)).rejects.toThrow(PreconditionFailed);

    expect(lockItemRepository.create).toHaveBeenCalledWith('1');
    expect(logger.error).toHaveBeenCalledWith(expect.any(Object), 'Deposit fail');
    expect(lockItemRepository.delete).toHaveBeenCalledWith('1');
  });

  it('should throw PreconditionFailed if customer balance is not found', async () => {
    const oldCustomerBalance = { _id: '1', customerId: '123', value: 1000 };
    const value = 500;
    const session = {} as ClientSession;

    lockItemRepository.create.mockResolvedValue(<any>true);
    customerBalanceRepository.findOne.mockResolvedValue(<any>null);

    await expect(depositService.execute(oldCustomerBalance, value, session)).rejects.toThrow(PreconditionFailed);

    expect(customerBalanceRepository.findOne).toHaveBeenCalledWith('123');
    expect(logger.error).toHaveBeenCalledWith(expect.any(Object), 'Deposit fail');
    expect(lockItemRepository.delete).toHaveBeenCalledWith('1');
  });

  it('should throw PreconditionFailed if update fails', async () => {
    const oldCustomerBalance = { _id: '1', customerId: '123', value: 1000 };
    const value = 500;
    const session = {} as ClientSession;

    lockItemRepository.create.mockResolvedValue(<any>true);
    customerBalanceRepository.findOne.mockResolvedValue(<any>{ customerId: '123', value: 1000 });
    extractRepository.create.mockResolvedValue(<any>true);
    customerBalanceRepository.update.mockResolvedValue(<any>null);

    await expect(depositService.execute(oldCustomerBalance, value, session)).rejects.toThrow(PreconditionFailed);

    expect(customerBalanceRepository.update).toHaveBeenCalledWith({ customerId: '123', value: 1500 }, session);
    expect(logger.error).toHaveBeenCalledWith(expect.any(Object), 'Deposit fail');
    expect(lockItemRepository.delete).toHaveBeenCalledWith('1');
  });

  it('should log an error and throw if an exception occurs', async () => {
    const oldCustomerBalance = { _id: '1', customerId: '123', value: 1000 };
    const value = 500;
    const session = {} as ClientSession;
    const error = new Error('Test error');

    lockItemRepository.create.mockResolvedValue(<any>true);
    customerBalanceRepository.findOne.mockRejectedValue(error);

    await expect(depositService.execute(oldCustomerBalance, value, session)).rejects.toThrow(error);

    expect(logger.error).toHaveBeenCalledWith({ error }, 'Deposit fail');
    expect(lockItemRepository.delete).toHaveBeenCalledWith('1');
  });
});
