import { Context, SQSEvent } from "aws-lambda";
import { BadRequest } from 'http-errors'
import { sqsMiddleware } from "../../application/middleware/sqs.middleware";

const reservation = (event: SQSEvent, context: Context) => {
    console.log(event.Records);
    throw new BadRequest('akiii tem q da erro mesmo e ficar repetindo até cair na dlq')
}

export const handler = sqsMiddleware(reservation);