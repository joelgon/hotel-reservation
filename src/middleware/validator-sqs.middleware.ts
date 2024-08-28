import { MiddlewareObj } from '@middy/core';
import { BadRequest } from 'http-errors';
import { plainToClass } from 'class-transformer';
import { SQSEvent } from 'aws-lambda';
import { validate, ValidationError } from 'class-validator';

export const validateSqsDtoMiddleware = (DtoClass: new () => object): MiddlewareObj<SQSEvent> => {
    const formatErrors = (errors: ValidationError[]): string => {
        return errors
            .map(error => Object.values(error.constraints ?? {}).join(', '))
            .join('; ');
    }

    return {
        before: async (handler) => {
            for (let index = 0; index < handler.event.Records.length; index++) {
                const body = JSON.parse(handler.event.Records[index].body ?? '{}');
                const dtoInstance = plainToClass(DtoClass, body);
                const errors: ValidationError[] = await validate(dtoInstance, {
                    whitelist: true,
                    forbidNonWhitelisted: true,
                    forbidUnknownValues: true,
                });

                if (errors.length > 0)
                    throw new BadRequest(`Validation failed: ${formatErrors(errors)}`)

                handler.event.Records[index].body = JSON.stringify(dtoInstance);
            }
        }
    };
};
