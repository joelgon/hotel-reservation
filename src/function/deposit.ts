import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { DepositService } from "../services/deposit.service";
import { authMiddleware } from "../middleware/auth.middleware";
import { DepositDto } from "../dtos/deposit.dto";
import { CustomerBalance } from "../model/customer-balance.model";

async function deposit(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
    const body = JSON.parse(event.body ?? '{}') as DepositDto;
    const customerBalance = event.requestContext.authorizer as CustomerBalance;

    const depositService = new DepositService();
    await depositService.execute(customerBalance, body.value);

    return {
        statusCode: 201,
        body: ''
    };
}

export const handler = authMiddleware(deposit, { bodyDto: DepositDto });