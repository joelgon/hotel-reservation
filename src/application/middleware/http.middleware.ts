import middy, { MiddyfiedHandler } from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import { dataBaseConnectionMiddleware } from "./database-connection.middleware";
import { Handler } from "aws-lambda";
import { LoggerMiddleware } from "./logger.middleware";
import { validateDtoMiddleware } from "./validator.middleware";
import { pathParamterValidatorMiddleware } from "./path-paramter-validator.middleware";

export const httpMiddleware = (handler: middy.PluginObject | Handler<unknown, any>, { bodyDto, pathParametersDto }: { bodyDto?: new () => object, pathParametersDto?: new () => object } = {}): MiddyfiedHandler<any, any, any, any, any> => {
    const mid = middy(handler)
        .use(LoggerMiddleware())
        .use(httpErrorHandler());

    if (pathParametersDto) mid.use(pathParamterValidatorMiddleware(pathParametersDto))

    if (bodyDto) mid.use(validateDtoMiddleware(bodyDto));

    mid
        .use(dataBaseConnectionMiddleware());

    return mid;
}