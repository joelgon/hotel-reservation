import { Context, SQSEvent } from "aws-lambda";
import { sqsMiddleware } from "../middleware/sqs.middleware";
import { ProofPaymentDto } from "../dtos/proof-payment.dto";
import { ProofPaymentService } from "../services/proof-payment.service";

async function proofPayment(event: SQSEvent, context: Context): Promise<void> {
    await Promise.all(event.Records.map(async (record) => {
        const body = JSON.parse(record.body ?? '{}') as ProofPaymentDto;

        const proofPaymentService = new ProofPaymentService();

        await proofPaymentService.execute(body);
    }));
}

export const handler = sqsMiddleware(proofPayment, { bodyDto: ProofPaymentDto });