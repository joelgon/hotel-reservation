import { MiddlewareObj } from '@middy/core';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { plainToClass } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { BadRequest } from 'http-errors';

export const validateDtoMiddleware = (DtoClass: new () => object): MiddlewareObj<APIGatewayProxyEvent> => {
  const formatErrors = (errors: ValidationError[]): string => {
    return errors.map((error) => Object.values(error.constraints ?? {}).join(', ')).join('; ');
  };

  return {
    before: async (handler) => {
      const body = JSON.parse(handler.event.body ?? '{}');
      const dtoInstance = plainToClass(DtoClass, body);
      const errors: ValidationError[] = await validate(dtoInstance, {
        whitelist: true,
        forbidNonWhitelisted: true,
        forbidUnknownValues: true,
      });

      if (errors.length > 0) throw new BadRequest(`Validation failed: ${formatErrors(errors)}`);

      handler.event.body = JSON.stringify(dtoInstance);
    },
  };
};
