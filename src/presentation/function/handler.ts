import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { logger, withRequest } from '../../infrastructure/logger';
import { httpAuthMiddleware } from '../../application/middleware/http-auth.middleware';


async function test (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
  logger.info({ data: 'Some data' }, 'A log message');

  return {
    statusCode: 200,
    body: JSON.stringify(event)
  };
};

export const hello = httpAuthMiddleware(test)