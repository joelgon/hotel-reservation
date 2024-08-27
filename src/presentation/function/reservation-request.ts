import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { RservationRequestDto } from "../dtos/reservation-request.dto";
import { httpAuthMiddleware } from "../../application/middleware/http-auth.middleware";
import { ReservationRequestUseCase } from "../../application/use-case/reservation-request.use-case";
import { customerEntity } from "../../domain/entities/customer.entity";
import { ReservationRepository } from "../../infra/database/repositories/reservation.repository";
import { logger } from "../../infra/logger";
import { RoomRepository } from "../../infra/database/repositories/room.repository";
import { SendMessaging } from "../../infra/messaging/send-messaging";

async function reservationRequest (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
  const body = JSON.parse(event.body ?? '{}') as RservationRequestDto;
    const customer = event.requestContext.authorizer as customerEntity;

    const reservationRepository = new ReservationRepository();
    const roomRepository = new RoomRepository();
    const sendMessaging = new SendMessaging();
    const reservationRequestUseCase = new ReservationRequestUseCase(logger, reservationRepository, roomRepository, sendMessaging);

    return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Go Serverless v4.0! Your function executed successfully!'
        })
      };
}

export const handler = httpAuthMiddleware(reservationRequest, { bodyDto: RservationRequestDto });