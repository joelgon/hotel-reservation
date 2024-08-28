import mongoose from "mongoose";
import { connectToDatabase } from "../config/dbConfig";
import { APIGatewayProxyEvent } from "aws-lambda";
import { MiddlewareObj } from "@middy/core";
import { logger } from "../utils/logger.util";

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