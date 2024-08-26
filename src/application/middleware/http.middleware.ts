import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import { dataBaseConnectionMiddleware } from "./database-connection.middleware";
import { authenticateUserMiddleware } from "./authenticate-user.middleware";
import { Handler } from "aws-lambda";
import { LoggerMiddleware } from "./logger.middleware";

export const httpMiddleware = (handler: middy.PluginObject | Handler<unknown, any>) => {
    return middy(handler)
        .use(LoggerMiddleware())
        .use(httpErrorHandler())
        .use(dataBaseConnectionMiddleware());
}