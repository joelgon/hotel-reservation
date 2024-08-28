import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { ReservationDto } from "../dtos/reservation.dto";
import { authMiddleware } from "../../middleware/auth.middleware";
import { ReservationUseCase } from "../../application/use-case/reservation.use-case";
import { ReservationRepository } from "../../infra/database/repositories/reservation.repository";
import { logger } from "../../infra/logger";
import { RoomRepository } from "../../infra/database/repositories/room.repository";
import { SendMessaging } from "../../infra/messaging/send-messaging";
import { customerBalanceEntity } from "../../domain/entities/customer-balance.entity";
import { LockItemRepository } from "../../infra/database/repositories/lock-item.repository";
import { CustomerBalanceRepository } from "../../infra/database/repositories/customer-balance.repository";
import { ExtractRepository } from "../../infra/database/repositories/extract.repository";

async function reservationRequest (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
  const body = JSON.parse(event.body ?? '{}') as ReservationDto;
    const customer = event.requestContext.authorizer as customerBalanceEntity;

    const reservationRepository = new ReservationRepository();
    const roomRepository = new RoomRepository();
    const lockItemRepository = new LockItemRepository();
    const customerBalanceRepository = new CustomerBalanceRepository();
    const extractRepository = new ExtractRepository();
    const sendMessaging = new SendMessaging();
    
    const reservationRequestUseCase = new ReservationUseCase(
      logger,
      reservationRepository,
      roomRepository,
      lockItemRepository,
      customerBalanceRepository,
      extractRepository,
      sendMessaging
    );

    const reservation = await reservationRequestUseCase.execute(customer, body);
    
    return {
        statusCode: 200,
        body: JSON.stringify(reservation)
      };
}

export const handler = authMiddleware(reservationRequest, { bodyDto: ReservationDto });