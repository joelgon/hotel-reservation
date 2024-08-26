import { MiddlewareObj } from '@middy/core';
import { BadRequest } from 'http-errors';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';

export const pathParamterValidatorMiddleware = (DtoClass: new () => Object): MiddlewareObj<APIGatewayProxyEvent> => {
    return {
        before: async (handler) => {
            const formatErrors = (errors: ValidationError[]): string => {
                return errors
                    .map(error => Object.values(error.constraints ?? {}).join(', '))
                    .join('; ');
            }

            const pathParameters = handler.event.pathParameters ?? {};
            const dtoInstance = plainToClass(DtoClass, pathParameters);
            const errors: ValidationError[] = await validate(dtoInstance, {
                whitelist: true,
                forbidNonWhitelisted: true,
                forbidUnknownValues: true,
            });

            if (errors.length > 0)
                throw new BadRequest(`Validation failed: ${formatErrors(errors)}`)

            handler.event.pathParameters = dtoInstance as any;
        }
    };
};
