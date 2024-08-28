import { MiddlewareObj } from '@middy/core';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { Unauthorized } from 'http-errors'
import { AuthProvider } from '../providers/auth.provider';
import { CustomerBalanceRepository } from '../repositories/customer-balance.repository';

export const authenticateUserMiddleware = (): MiddlewareObj<APIGatewayProxyEvent> => {
    return {
        before: async (handler) => {
            const token = handler.event.headers.Authorization?.split(' ')[1];

            if (!token) throw new Unauthorized();

            const authProvider = new AuthProvider();
            const decode = authProvider.verify(token);

            const customerBalanceRepository = new CustomerBalanceRepository();
            const customerBalance = await customerBalanceRepository.findOne(decode.customerId);

            if (!customerBalance) throw new Unauthorized();
            
            handler.event.requestContext.authorizer = customerBalance;
        }
    };
};