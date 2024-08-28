import { MiddlewareObj } from '@middy/core';
import { APIGatewayProxyEvent } from 'aws-lambda';

import { connectToDatabase, disconnectFromDatabase } from '../config/dbConfig';
import { logger } from '../utils/logger.util';

export const dataBaseConnectionMiddleware = (): MiddlewareObj<APIGatewayProxyEvent> => {
  return {
    before: async () => {
      logger.info('Conectando ao banco de dados...');
      await connectToDatabase();
    },
    after: async () => {
      logger.info('Encerrando conexão com o banco de dados');
      await disconnectFromDatabase();
    },
  };
};
