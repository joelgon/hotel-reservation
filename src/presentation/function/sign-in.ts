import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { Context } from "vm";
import { noAuthMiddleware } from "../../application/middleware/no-auth.middleware";
import { SignInDto } from "../dtos/sign-in.dto";
import { SignInUseCase } from "../../application/use-case/sign-in.use-case";
import { logger } from "../../infra/logger";
import { CustomerRepository } from "../../infra/database/repositories/customer.repository";
import { CompareHash } from "../../infra/cipher/compare-hash";
import { JsonWebToken } from "../../infra/jwt";

async function signIn(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
    const body = JSON.parse(event.body ?? '{}');

    const customerRepository = new CustomerRepository();
    const compareHash = new CompareHash();
    const jsonWebToken = new JsonWebToken()
    const signInUseCase = new SignInUseCase(logger, customerRepository, compareHash, jsonWebToken);

    const res = await signInUseCase.execute(body);
    return {
        statusCode: 200,
        body: JSON.stringify(res)
    };
}

export const handler = noAuthMiddleware(signIn, { bodyDto: SignInDto });