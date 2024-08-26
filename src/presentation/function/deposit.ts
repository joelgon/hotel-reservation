import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { httpMiddleware } from "../../application/middleware/http.middleware";
import { DepositDto } from "../dtos/deposit.dto";

function deposit(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
    const body = JSON.parse(event.body ?? '{}');
}

export const handler = httpMiddleware(deposit, { bodyDto: DepositDto });