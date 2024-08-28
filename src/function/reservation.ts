import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { authMiddleware } from "../middleware/auth.middleware";
import { ReservationDto } from "../dtos/reservation.dto";
import { ReservationService } from "../services/reservation.service";
import { CustomerBalance } from "../model/customer-balance.model";

async function reservationRequest (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
  const body = JSON.parse(event.body ?? '{}') as ReservationDto;
    const customer = event.requestContext.authorizer as CustomerBalance;
    
    const reservationService = new ReservationService();
    const reservation = await reservationService.execute(customer, body);
    
    return {
        statusCode: 200,
        body: JSON.stringify(reservation)
      };
}

export const handler = authMiddleware(reservationRequest, { bodyDto: ReservationDto });