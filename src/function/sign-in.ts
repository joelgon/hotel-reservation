import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { SignInService } from "../services/sign-in.service";
import { noAuthMiddleware } from "../middleware/no-auth.middleware";
import { SignInDto } from "../dtos/sign-in.dto";


async function signIn(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
    const body = JSON.parse(event.body ?? '{}');

    const signInService = new SignInService();

    const res = await signInService.execute(body);
    return {
        statusCode: 200,
        body: JSON.stringify(res)
    };
}

export const handler = noAuthMiddleware(signIn, { bodyDto: SignInDto });