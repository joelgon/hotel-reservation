import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { FailedDependency } from 'http-errors';

import { logger } from '../common/utils/logger.util';

interface IGetFile {
  bucket: string;
  key: string;
  expiresIn?: number;
}

export class GetPresignedUrlProvider {
  private readonly client: S3Client;

  constructor() {
    this.client = new S3Client({
      endpoint: process.env.S3_ENDPOINT,
    });
  }

  async execute({ bucket, key, expiresIn = 60 }: IGetFile): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      const url = await getSignedUrl(this.client, command, { expiresIn });
      return url;
    } catch (error) {
      logger.error({ error }, 'Fail to generate signed URL');
      throw new FailedDependency();
    }
  }
}
