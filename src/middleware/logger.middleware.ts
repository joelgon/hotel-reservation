import { MiddlewareObj } from '@middy/core';
import { APIGatewayProxyEvent } from 'aws-lambda';

import { withRequest } from '../utils/logger.util';

export const LoggerMiddleware = (): MiddlewareObj<APIGatewayProxyEvent> => {
  return {
    before: async (handler) => {
      withRequest(handler.event, handler.context);
    },
  };
};
