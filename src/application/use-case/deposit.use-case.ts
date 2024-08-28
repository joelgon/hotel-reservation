import { Logger } from "pino";
import { Big } from 'big.js'
import { PreconditionFailed } from 'http-errors';
import { Transaction } from "../../common/decorator/transaction.decorator";
import { ICustomerBalanceRepository } from "../../domain/repositories/customer-balance.repository";
import { IExtractRepository } from "../../domain/repositories/extract.repository";
import { ClientSession } from "mongoose";
import { ILockItemRepository } from "../../domain/repositories/lock-item.repository";
import { customerBalanceEntity } from "../../domain/entities/customer-balance.entity";

export class DepositUseCase {
    private readonly logger: Logger;
    private readonly customerBalanceRepository: ICustomerBalanceRepository;
    private readonly extractRepository: IExtractRepository;
    private readonly lockItemRepository: ILockItemRepository

    constructor(logger: Logger, customerBalanceRepository: ICustomerBalanceRepository, extractRepository: IExtractRepository, lockItemRepository: ILockItemRepository) {
        this.logger = logger;
        this.customerBalanceRepository = customerBalanceRepository;
        this.extractRepository = extractRepository;
        this.lockItemRepository = lockItemRepository;
    }

    @Transaction()
    async execute(oldCustomerBalance: customerBalanceEntity, value: number, session?: ClientSession) {
        try {
            this.logger.info({ value, oldCustomerBalance }, 'Deposit Strat');

            const lockItem = await this.lockItemRepository.create(oldCustomerBalance._id.toString());
            if (!lockItem) throw new PreconditionFailed(`Registration blocked`);

            const customerBalance = await this.customerBalanceRepository.findOne(oldCustomerBalance.customerId?.toString());
            if (!customerBalance) throw new PreconditionFailed(`customer balance`);

            await this.extractRepository.create({ customerId: customerBalance.customerId?.toString(), description: 'Aporte Realizado', value }, session);

            const balance = new Big(customerBalance.value);
            const valueDeposit = new Big(value);
            const updateBalance = balance.add(valueDeposit).toNumber();

            const succesUpdate = await this.customerBalanceRepository.update({ customerId: customerBalance.customerId?.toString(), value: updateBalance }, session);
            if (!succesUpdate) throw new PreconditionFailed(`CustomerBalance not found`);

            this.logger.info({ ...customerBalance, value: updateBalance }, 'Deposit success');
        } catch (error) {
            throw error;
        } finally {
            await this.lockItemRepository.delete(oldCustomerBalance._id.toString())
        }
    }
}