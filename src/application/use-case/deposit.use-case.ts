import { Logger } from "pino";
import { Big } from 'big.js'
import { PreconditionFailed } from 'http-errors';
import { customerEntity } from "../../domain/entities/customer.entity";
import { Transaction } from "../../common/decorator/transaction.decorator";
import { ICustomerBalanceRepository } from "../../domain/repositories/customer-balance.repository";
import { IExtractRepository } from "../../domain/repositories/extract.repository";
import { ClientSession } from "mongoose";

export class DepositUseCase {
    private readonly logger: Logger;
    private readonly customerBalanceRepository: ICustomerBalanceRepository;
    private readonly extractRepository: IExtractRepository;

    constructor(logger: Logger, customerBalanceRepository: ICustomerBalanceRepository, extractRepository: IExtractRepository) {
        this.logger = logger;
        this.customerBalanceRepository = customerBalanceRepository;
        this.extractRepository = extractRepository;
    }

    @Transaction()
    async execute(customer: customerEntity, value: number, session?: ClientSession) {
        this.logger.info({ value, customer: { ...customer, password: undefined } }, 'Deposit Strat');

        const customerBalance = await this.customerBalanceRepository.findByIdAndLock(customer._id?.toString(), session);
        if (!customerBalance) throw new PreconditionFailed(`CustomerBalance not found`);

        await this.extractRepository.create({ customerId: customer._id?.toString(), description: 'Aporte Realizado', value });
        
        const balance = new Big(customerBalance.value);
        const valueDeposit = new Big(value);
        const updateBalance = balance.add(valueDeposit).toNumber();

        const succesUpdate = await this.customerBalanceRepository.updateAndUnLock({ customerId: customer._id?.toString(), value: updateBalance });
        if (!succesUpdate) throw new PreconditionFailed(`CustomerBalance not found`);

        this.logger.info({ ...customerBalance, value: updateBalance }, 'Deposit success');
        throw new PreconditionFailed(`CustomerBalance not found`);
    }
}