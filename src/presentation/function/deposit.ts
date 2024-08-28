import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { DepositDto } from "../dtos/deposit.dto";
import { DepositUseCase } from "../../application/use-case/deposit.use-case";
import { logger } from "../../infra/logger";
import { CustomerBalanceRepository } from "../../infra/database/repositories/customer-balance.repository";
import { ExtractRepository } from "../../infra/database/repositories/extract.repository";
import { authMiddleware } from "../../application/middleware/auth.middleware";
import { LockItemRepository } from "../../infra/database/repositories/lock-item.repository";
import { customerBalanceEntity } from "../../domain/entities/customer-balance.entity";

async function deposit(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
    const body = JSON.parse(event.body ?? '{}') as DepositDto;
    const customerBalance = event.requestContext.authorizer as customerBalanceEntity;

    const customerBalanceRepository = new CustomerBalanceRepository();
    const extractRepository = new ExtractRepository()
    const lockItemRepository = new LockItemRepository();
    const depositUseCase = new DepositUseCase(logger, customerBalanceRepository, extractRepository, lockItemRepository);

    await depositUseCase.execute(customerBalance, body.value);

    return {
        statusCode: 201,
        body: ''
    };
}

export const handler = authMiddleware(deposit, { bodyDto: DepositDto });