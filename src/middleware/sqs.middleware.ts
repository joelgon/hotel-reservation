import middy from '@middy/core';
import { Handler } from 'aws-lambda';

import { dataBaseConnectionMiddleware } from './database-connection.middleware';
import { LoggerMiddleware } from './logger.middleware';
import { validateSqsDtoMiddleware } from './validator-sqs.middleware';

export const sqsMiddleware = (handler: middy.PluginObject | Handler<unknown, unknown>, { bodyDto }: { bodyDto?: new () => object } = {}) => {
  const mid = middy(handler).use(LoggerMiddleware()).use(dataBaseConnectionMiddleware());

  if (bodyDto) mid.use(validateSqsDtoMiddleware(bodyDto));

  return mid;
};
