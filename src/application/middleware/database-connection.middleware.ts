import mongoose from "mongoose";
import { connectToDatabase } from "../../infrastructure/database/dbConfig";
import { APIGatewayProxyEvent } from "aws-lambda";
import { MiddlewareObj } from "@middy/core";
import { logger } from "../../infrastructure/logger";

export const dataBaseConnectionMiddleware = (): MiddlewareObj<APIGatewayProxyEvent> => {
    return {
        before: async (handler) => {
            if (!mongoose.connection.readyState) {
                logger.info('Conectando ao banco de dados...');
                await connectToDatabase();
            }
        }
    }
};