import { Context, SQSEvent } from "aws-lambda";
import { sqsMiddleware } from "../../application/middleware/sqs.middleware";
import { ProofPaymentDto } from "../dtos/proof-payment.dto";

async function proofPayment(event: SQSEvent, context: Context): Promise<void> {
    await Promise.all(event.Records.map(async (record) => {
        const body = JSON.parse(record.body ?? '{}') as ProofPaymentDto;

        // const reservationUseCase = new ReservationUseCase(logger);

        // await reservationUseCase.execute(body);
    }));
}

export const handler = sqsMiddleware(proofPayment, { bodyDto: ProofPaymentDto });