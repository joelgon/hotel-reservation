import middy, { MiddyfiedHandler } from '@middy/core';
import httpErrorHandler from '@middy/http-error-handler';
import { Context, Handler } from 'aws-lambda';

import { authenticateUserMiddleware } from './authenticate-user.middleware';
import { dataBaseConnectionMiddleware } from './database-connection.middleware';
import { LoggerMiddleware } from './logger.middleware';
import { validateDtoMiddleware } from './validator.middleware';

export const authMiddleware = (
  handler: middy.PluginObject | Handler<unknown, unknown>,
  { bodyDto }: { bodyDto?: new () => object; pathParametersDto?: new () => object } = {}
): MiddyfiedHandler<unknown, unknown, unknown, Context, Record<string, unknown>> => {
  const mid = middy(handler).use(LoggerMiddleware()).use(httpErrorHandler());

  if (bodyDto) mid.use(validateDtoMiddleware(bodyDto));

  mid.use(dataBaseConnectionMiddleware()).use(authenticateUserMiddleware());

  return mid;
};
