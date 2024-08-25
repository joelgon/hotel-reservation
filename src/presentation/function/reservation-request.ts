import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import middy from '@middy/core';
import httpErrorHandler from '@middy/http-error-handler';
import { withRequest } from "../../infrastructure/logger";
import { DtoValidator } from "../../application/validator";
import { RservationRequestDto } from "../dtos/reservation-request.dto";

async function reservationRequest (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
    withRequest(event, context);

    await DtoValidator.validate(RservationRequestDto, JSON.parse(event.body ?? '{}'));

    return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Go Serverless v4.0! Your function executed successfully!'
        })
      };
}

export const handler = middy(reservationRequest).use(httpErrorHandler());