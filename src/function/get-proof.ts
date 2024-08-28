import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { authMiddleware } from "../middleware/auth.middleware";
import { CustomerBalance } from "../model/customer-balance.model";
import { GetPresignedUrlProvider } from "../providers/get-presigned-url.provider";
import { PROOF_PAYMENT_BUCKET } from "../common/constant/cloud-storage.constant";

async function getProof(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
    const reservationId = event.pathParameters?.reservationId;
    const customer = event.requestContext.authorizer as CustomerBalance;

    const getPresignedUrlProvider = new GetPresignedUrlProvider();
    const url = await getPresignedUrlProvider.execute({ bucket: PROOF_PAYMENT_BUCKET, key: `${customer.customerId}/${reservationId}.pdf` });

    return {
        statusCode: 200,
        body: JSON.stringify({ url })
    };
}

export const handler = authMiddleware(getProof);