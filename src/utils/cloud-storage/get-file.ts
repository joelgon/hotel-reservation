import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { FailedDependency } from 'http-errors';
import { logger } from "../logger";

interface IGetFile {
    bucket: string;
    key: string;
}

export class GetFile {
    private readonly client: S3Client;

    constructor() {
        this.client = new S3Client({
            endpoint: 'http://s3.us-east-1.localhost.localstack.cloud:4566'
        });
    }

    async execute({ bucket, key }: IGetFile): Promise<Uint8Array> {
        try {
            const command = new GetObjectCommand({
                Bucket: bucket,
                Key: key,
            });

            const response = await this.client.send(command);
            if (response.Body) return response.Body.transformToByteArray();
        } catch (error) {
            logger.error({ error }, 'Fail to get file in S3');
        }

        throw new FailedDependency()
    }
}