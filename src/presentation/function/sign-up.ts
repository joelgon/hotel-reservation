import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import middy from '@middy/core';
import { logger, withRequest } from "../../infrastructure/logger";
import { DtoValidator } from "../../application/validator";
import { SignUpDto } from "../dtos/sign-up.dto";
import { CustomerRepository } from "../../infrastructure/database/repositories/customer.repository";
import { connectToDatabase, disconnectFromDatabase } from "../../infrastructure/database/dbConfig";
import httpErrorHandler from "@middy/http-error-handler";
import { SignUpUseCase } from "../../application/sign-up/sign-up.use-case";
import { CustomerBalanceRepository } from "../../infrastructure/database/repositories/customer-balance.repository";
import { Encription } from "../../infrastructure/cipher/encription";

async function signUp(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
    withRequest(event, context);

    await connectToDatabase();

    const body = await DtoValidator.validate(SignUpDto, JSON.parse(event.body ?? '{}'));

    const customerRepository = new CustomerRepository();
    const customerBalanceRepository = new CustomerBalanceRepository();
    const encription = new Encription();
    const signUpUseCase = new SignUpUseCase(logger, customerRepository, customerBalanceRepository, encription);

    const customer = await signUpUseCase.execute(body);

    disconnectFromDatabase()

    return {
        statusCode: 200,
        body: JSON.stringify(customer)
    };
}

export const handler = middy(signUp).use(httpErrorHandler());