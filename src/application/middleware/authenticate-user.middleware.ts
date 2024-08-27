import { MiddlewareObj } from '@middy/core';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { Unauthorized } from 'http-errors'
import { JsonWebToken } from '../../infrastructure/jwt';
import { CustomerRepository } from '../../infrastructure/database/repositories/customer.repository';

export const authenticateUserMiddleware = (): MiddlewareObj<APIGatewayProxyEvent> => {
    return {
        before: async (handler) => {
            const token = handler.event.headers.Authorization?.split(' ')[1];

            if (!token) throw new Unauthorized();

            const jsonWebToken = new JsonWebToken();
            const decode = jsonWebToken.verify(token);

            const customerRepository = new CustomerRepository();
            const customer = await customerRepository.findById(decode.customerId);

            if (!customer) if (!token) throw new Unauthorized();
            
            handler.event.requestContext.authorizer = customer;
        }
    };
};