import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { logger } from "../../infra/logger";
import { SignUpDto } from "../dtos/sign-up.dto";
import { CustomerRepository } from "../../infra/database/repositories/customer.repository";
import { SignUpUseCase } from "../../application/use-case/sign-up.use-case";
import { CustomerBalanceRepository } from "../../infra/database/repositories/customer-balance.repository";
import { Encription } from "../../infra/cipher/encription";
import { JsonWebToken } from "../../infra/jwt";
import { noAuthMiddleware } from "../../middleware/no-auth.middleware";

async function signUp(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
    const body = JSON.parse(event.body ?? '{}');

    const customerRepository = new CustomerRepository();
    const customerBalanceRepository = new CustomerBalanceRepository();
    const encription = new Encription();
    const jsonWebToken = new JsonWebToken();
    const signUpUseCase = new SignUpUseCase(logger, customerRepository, customerBalanceRepository, encription, jsonWebToken);

    const customer = await signUpUseCase.execute(body);

    return {
        statusCode: 200,
        body: JSON.stringify(customer)
    };
}

export const handler = noAuthMiddleware(signUp, { bodyDto: SignUpDto });