import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { SignInDto } from '../dtos/sign-in.dto';
import { noAuthMiddleware } from '../middleware/no-auth.middleware';
import { SignInService } from '../services/sign-in.service';

async function signIn(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const body = JSON.parse(event.body ?? '{}');

  const signInService = new SignInService();

  const res = await signInService.execute(body);
  return {
    statusCode: 200,
    body: JSON.stringify(res),
  };
}

export const handler = noAuthMiddleware(signIn, { bodyDto: SignInDto });
