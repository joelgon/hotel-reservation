import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

import { logger } from '../utils/logger.util';

interface ISaveFile {
  bucket: string;
  key: string;
  contentType: 'application/pdf';
  file: string | Uint8Array | Buffer;
}

export class SaveFileProvider {
  private readonly client: S3Client;

  constructor() {
    this.client = new S3Client({
      endpoint: 'http://s3.us-east-1.localhost.localstack.cloud:4566',
    });
  }

  async execute({ file, bucket, key, contentType }: ISaveFile): Promise<boolean> {
    try {
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: contentType,
        Body: file,
      });

      const response = await this.client.send(command);
      if (response.ETag) return true;
    } catch (error) {
      logger.error({ error }, 'Fail to save file in S3');
      return false;
    }

    return false;
  }
}
