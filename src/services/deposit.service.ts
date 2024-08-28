import { Logger } from "pino";
import { Big } from 'big.js'
import { PreconditionFailed } from 'http-errors';
import { ClientSession } from "mongoose";
import { CustomerBalanceRepository } from "../repositories/customer-balance.repository";
import { ExtractRepository } from "../repositories/extract.repository";
import { LockItemRepository } from "../repositories/lock-item.repository";
import { logger } from "../utils/logger";
import { Transaction } from "../common/decorator/transaction.decorator";
import { CustomerBalance } from '../model/customer-balance.model';

export class DepositService {
    private readonly logger: Logger;
    private readonly customerBalanceRepository: CustomerBalanceRepository;
    private readonly extractRepository: ExtractRepository;
    private readonly lockItemRepository: LockItemRepository;

    constructor() {
        this.logger = logger;
        this.customerBalanceRepository = new CustomerBalanceRepository();
        this.extractRepository = new ExtractRepository();
        this.lockItemRepository = new LockItemRepository();
    }

    @Transaction()
    async execute(oldCustomerBalance: CustomerBalance, value: number, session?: ClientSession) {
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