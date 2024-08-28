import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { SignUpService } from "../services/sign-up.service";
import { noAuthMiddleware } from "../middleware/no-auth.middleware";
import { SignUpDto } from "../dtos/sign-up.dto";

async function signUp(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
    const body = JSON.parse(event.body ?? '{}');

    const signUpService = new SignUpService();

    const customer = await signUpService.execute(body);

    return {
        statusCode: 200,
        body: JSON.stringify(customer)
    };
}

export const handler = noAuthMiddleware(signUp, { bodyDto: SignUpDto });