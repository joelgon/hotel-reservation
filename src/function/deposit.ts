import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { DepositDto } from '../dtos/deposit.dto';
import { authMiddleware } from '../middleware/auth.middleware';
import { CustomerBalance } from '../model/customer-balance.model';
import { DepositService } from '../services/deposit.service';

async function deposit(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const body = JSON.parse(event.body ?? '{}') as DepositDto;
  const customerBalance = event.requestContext.authorizer as CustomerBalance;

  const depositService = new DepositService();
  await depositService.execute(customerBalance, body.value);

  return {
    statusCode: 201,
    body: '',
  };
}

export const handler = authMiddleware(deposit, { bodyDto: DepositDto });
