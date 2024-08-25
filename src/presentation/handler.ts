import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { logger, withRequest } from '../infrastructure/logger';

export async function hello (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
  withRequest(event, context);

  logger.info({ data: 'Some data' }, 'A log message');
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Go Serverless v4.0! Your function executed successfully!'
    })
  };
};
