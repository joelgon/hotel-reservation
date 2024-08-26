import middy, { MiddyfiedHandler } from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import { dataBaseConnectionMiddleware } from "./database-connection.middleware";
import { Handler } from "aws-lambda";
import { LoggerMiddleware } from "./logger.middleware";
import { validateDtoMiddleware } from "./validator.middleware";

export const httpMiddleware = (handler: middy.PluginObject | Handler<unknown, any>, DtoClass?: new () => object) => {
    const mid = middy(handler)
        .use(LoggerMiddleware())
        .use(httpErrorHandler());

    if (DtoClass) mid.use(validateDtoMiddleware(DtoClass));

    mid
        .use(dataBaseConnectionMiddleware());

    return mid;
}