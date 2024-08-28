import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { SignUpDto } from '../dtos/sign-up.dto';
import { noAuthMiddleware } from '../middleware/no-auth.middleware';
import { SignUpService } from '../services/sign-up.service';

async function signUp(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const body = JSON.parse(event.body ?? '{}');

  const signUpService = new SignUpService();

  const customer = await signUpService.execute(body);

  return {
    statusCode: 200,
    body: JSON.stringify(customer),
  };
}

export const handler = noAuthMiddleware(signUp, { bodyDto: SignUpDto });
