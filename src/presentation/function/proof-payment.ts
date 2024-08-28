import { Context, SQSEvent } from "aws-lambda";
import { sqsMiddleware } from "../../application/middleware/sqs.middleware";
import { ProofPaymentDto } from "../dtos/proof-payment.dto";
import { ProofPaymentUseCase } from "../../application/use-case/proof-payment.use-case";
import { logger } from "../../infra/logger";
import { CustomerRepository } from "../../infra/database/repositories/customer.repository";
import { GetFile } from "../../infra/cloud-storage/get-file";

async function proofPayment(event: SQSEvent, context: Context): Promise<void> {
    await Promise.all(event.Records.map(async (record) => {
        const body = JSON.parse(record.body ?? '{}') as ProofPaymentDto;

        const customerRepository = new CustomerRepository();
        const getFile = new GetFile();
        const proofPaymentUseCase = new ProofPaymentUseCase(logger, customerRepository, getFile);

        await proofPaymentUseCase.execute(body);
    }));
}

export const handler = sqsMiddleware(proofPayment, { bodyDto: ProofPaymentDto });