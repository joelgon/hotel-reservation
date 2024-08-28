import { SQSEvent } from 'aws-lambda';

import { ProofPaymentDto } from '../dtos/proof-payment.dto';
import { sqsMiddleware } from '../middleware/sqs.middleware';
import { ProofPaymentService } from '../services/proof-payment.service';

async function proofPayment(event: SQSEvent): Promise<void> {
  await Promise.all(
    event.Records.map(async (record) => {
      const body = JSON.parse(record.body ?? '{}') as ProofPaymentDto;

      const proofPaymentService = new ProofPaymentService();

      await proofPaymentService.execute(body);
    })
  );
}

export const handler = sqsMiddleware(proofPayment, { bodyDto: ProofPaymentDto });
