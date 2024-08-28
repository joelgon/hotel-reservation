import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { ReservationDto } from '../dtos/reservation.dto';
import { authMiddleware } from '../middleware/auth.middleware';
import { CustomerBalance } from '../model/customer-balance.model';
import { ReservationService } from '../services/reservation.service';

async function reservationRequest(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const body = JSON.parse(event.body ?? '{}') as ReservationDto;
  const customer = event.requestContext.authorizer as CustomerBalance;

  const reservationService = new ReservationService();
  const reservation = await reservationService.execute(customer, body);

  return {
    statusCode: 200,
    body: JSON.stringify(reservation),
  };
}

export const handler = authMiddleware(reservationRequest, { bodyDto: ReservationDto });
