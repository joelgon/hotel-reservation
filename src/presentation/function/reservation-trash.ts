import { Context, SQSEvent } from "aws-lambda";
import { sqsMiddleware } from "../../application/middleware/sqs.middleware";
import { ReservationDto } from "../dtos/reservation.dto";
// import { ReservationUseCase } from "../../application/use-case/reservation.use-case";
import { logger } from "../../infra/logger";

async function reservation(event: SQSEvent, context: Context): Promise<void> {
    await Promise.all(event.Records.map(async (record) => {
        const body = JSON.parse(record.body ?? '{}') as ReservationDto;

        // const reservationUseCase = new ReservationUseCase(logger);

        // await reservationUseCase.execute(body);
    }));
}

export const handler = sqsMiddleware(reservation, { bodyDto: ReservationDto });