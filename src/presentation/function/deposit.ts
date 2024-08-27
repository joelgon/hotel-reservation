import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { DepositDto } from "../dtos/deposit.dto";
import { customerEntity } from "../../domain/entities/customer.entity";
import { DepositUseCase } from "../../application/use-case/deposit.use-case";
import { logger } from "../../infrastructure/logger";
import { CustomerBalanceRepository } from "../../infrastructure/database/repositories/customer-balance.repository";
import { ExtractRepository } from "../../infrastructure/database/repositories/extract.repository";
import { httpAuthMiddleware } from "../../application/middleware/http-auth.middleware";
import { LockItemRepository } from "../../infrastructure/database/repositories/lock-item.repository";

async function deposit(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
    const body = JSON.parse(event.body ?? '{}') as DepositDto;
    const customer = event.requestContext.authorizer as customerEntity;

    const customerBalanceRepository = new CustomerBalanceRepository();
    const extractRepository = new ExtractRepository()
    const lockItemRepository = new LockItemRepository();
    const depositUseCase = new DepositUseCase(logger, customerBalanceRepository, extractRepository, lockItemRepository);

    await depositUseCase.execute(customer, body.value);

    return {
        statusCode: 201,
        body: ''
    };
}

export const handler = httpAuthMiddleware(deposit, { bodyDto: DepositDto });