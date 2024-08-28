import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { NotFound } from 'http-errors';
import { logger } from '../logger';

interface ISendMessage<T extends object> {
    body: T;
    groupId: string;
    deduplicationId: string;
    queueName: string;
}

export class SendMessaging {
    private readonly client: SQSClient;

    constructor() {
        this.client = new SQSClient();
    }

    async execute<T extends object = any>({ body, deduplicationId, groupId, queueName }: ISendMessage<T>): Promise<Boolean> {
        try {
            const command = new SendMessageCommand({
                QueueUrl: `http://sqs.us-east-1.localhost.localstack.cloud:4566/000000000000/${queueName}`,
                MessageBody: JSON.stringify(body),
                MessageDeduplicationId: deduplicationId,
                MessageGroupId: groupId,
            });

            const result = await this.client.send(command);
            if (!result?.MessageId) throw new NotFound('Failed to send message')

            logger.info({ body, queueName, messageId: result.MessageId, status: 'OK' })

            return true;
        } catch (error) {
            logger.error({ body, queueName, error, status: 'ERROR' })
            return false;
        }
    }
}