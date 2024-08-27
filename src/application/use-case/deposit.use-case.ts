import { Logger } from "pino";
import { Big } from 'big.js'
import { PreconditionFailed } from 'http-errors';
import { customerEntity } from "../../domain/entities/customer.entity";
import { Transaction } from "../../common/decorator/transaction.decorator";
import { ICustomerBalanceRepository } from "../../domain/repositories/customer-balance.repository";
import { IExtractRepository } from "../../domain/repositories/extract.repository";
import { ClientSession } from "mongoose";
import { ILockItemRepository } from "../../domain/repositories/lock-item.repository";

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
    async execute(customer: customerEntity, value: number, session?: ClientSession) {
        this.logger.info({ value, customer: { ...customer, password: undefined } }, 'Deposit Strat');

        const customerBalance = await this.customerBalanceRepository.findOne(customer._id?.toString(), session);
        if (!customerBalance) throw new PreconditionFailed(`CustomerBalance not found`);

        const lockItem = await this.lockItemRepository.create(customerBalance._id.toString());
        if (!lockItem) throw new PreconditionFailed(`Registration blocked`);

        await this.extractRepository.create({ customerId: customer._id?.toString(), description: 'Aporte Realizado', value }, session);
        
        const balance = new Big(customerBalance.value);
        const valueDeposit = new Big(value);
        const updateBalance = balance.add(valueDeposit).toNumber();

        const succesUpdate = await this.customerBalanceRepository.update({ customerId: customer._id?.toString(), value: updateBalance });
        if (!succesUpdate) throw new PreconditionFailed(`CustomerBalance not found`);

        await this.lockItemRepository.delete(customerBalance._id.toString())

        this.logger.info({ ...customerBalance, value: updateBalance }, 'Deposit success');
    }
}