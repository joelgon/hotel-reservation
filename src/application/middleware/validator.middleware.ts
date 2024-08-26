import { MiddlewareObj } from '@middy/core';
import { BadRequest } from 'http-errors';
import { plainToClass } from 'class-transformer';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { validate, ValidationError } from 'class-validator';

export const validateDtoMiddleware = (DtoClass: new () => object): MiddlewareObj<APIGatewayProxyEvent> => {
    const formatErrors = (errors: ValidationError[]): string => {
        return errors
            .map(error => Object.values(error.constraints ?? {}).join(', '))
            .join('; ');
    }

    return {
        before: async (handler) => {
            const body = JSON.parse(handler.event.body ?? '{}');
            const dtoInstance = plainToClass(DtoClass, body);
            const errors: ValidationError[] = await validate(dtoInstance, {
                whitelist: true, // Remove as propriedades não definidas no DTO
                forbidNonWhitelisted: true, // Lança erro se houver propriedades não definidas
                forbidUnknownValues: true, // Lança erro para valores desconhecidos
              });

            if (errors.length > 0)
                throw new BadRequest(`Validation failed: ${formatErrors(errors)}`)
        }
    };
};
