import { randomUUID } from 'crypto';
import pino from 'pino';
import { LambdaContext, LambdaEvent, lambdaRequestTracker, pinoLambdaDestination } from 'pino-lambda';

const destination = pinoLambdaDestination();

export const logger = pino(destination);

export const withRequest = lambdaRequestTracker({
  requestMixin: (event: LambdaEvent, context: LambdaContext) => {
    const isSQSEvent = event.Records && event.Records[0] && event.Records[0].eventSource === 'aws:sqs';
    
    return {
      host: event.headers?.host,
      requestId: event.headers?.requestId ?? randomUUID(),
      awsRequestId: context.awsRequestId,
      isSQSEvent,
      ...(isSQSEvent && {
        sqsMessageId: event.Records[0].messageId,
        sqsEventSource: event.Records[0].eventSource,
        sqsBody: event.Records[0].body,
      }),
    };
  },
});
