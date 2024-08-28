import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { NotFound } from 'http-errors';

import { SendMessagingProvider } from './send-messaging.provider';
import { logger } from '../common/utils/logger.util';

jest.mock('@aws-sdk/client-sqs');
jest.mock('../common/utils/logger.util');

describe('SendMessagingProvider', () => {
  let sendMessagingProvider: SendMessagingProvider;

  beforeEach(() => {
    sendMessagingProvider = new SendMessagingProvider();
  });

  it('should send a message successfully and return true', async () => {
    const body = { test: 'message' };
    const groupId = 'test-group';
    const deduplicationId = 'test-deduplication';
    const queueName = 'test-queue';
    const mockResponse = { MessageId: 'mock-message-id' };

    (SQSClient.prototype.send as jest.Mock).mockResolvedValue(mockResponse);

    const result = await sendMessagingProvider.execute({ body, groupId, deduplicationId, queueName });

    expect(SQSClient.prototype.send).toHaveBeenCalledWith(expect.any(SendMessageCommand));
    expect(result).toBe(true);
    expect(logger.info).toHaveBeenCalledWith({
      body,
      queueName,
      messageId: mockResponse.MessageId,
      status: 'OK',
    });
  });

  it('should throw NotFound error if MessageId is not returned', async () => {
    const body = { test: 'message' };
    const groupId = 'test-group';
    const deduplicationId = 'test-deduplication';
    const queueName = 'test-queue';

    (SQSClient.prototype.send as jest.Mock).mockResolvedValue({});

    const success = await sendMessagingProvider.execute({ body, groupId, deduplicationId, queueName });
    expect(success).toBe(false);

    expect(logger.error).toHaveBeenCalledWith({
      body,
      queueName,
      error: new NotFound('Failed to send message'),
      status: 'ERROR',
    });
  });

  it('should log an error and return false if an exception occurs', async () => {
    const body = { test: 'message' };
    const groupId = 'test-group';
    const deduplicationId = 'test-deduplication';
    const queueName = 'test-queue';
    const error = new Error('Test error');

    (SQSClient.prototype.send as jest.Mock).mockRejectedValue(error);

    const result = await sendMessagingProvider.execute({ body, groupId, deduplicationId, queueName });

    expect(result).toBe(false);
    expect(logger.error).toHaveBeenCalledWith({
      body,
      queueName,
      error,
      status: 'ERROR',
    });
  });
});
