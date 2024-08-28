import { MiddlewareObj } from '@middy/core';
import { APIGatewayProxyEvent } from 'aws-lambda';
import mongoose from 'mongoose';

import { connectToDatabase } from '../config/dbConfig';
import { logger } from '../utils/logger.util';

export const dataBaseConnectionMiddleware = (): MiddlewareObj<APIGatewayProxyEvent> => {
  return {
    before: async () => {
      if (!mongoose.connection.readyState) {
        logger.info('Conectando ao banco de dados...');
        await connectToDatabase();
      }
    },
  };
};
