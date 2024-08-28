import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { FailedDependency } from 'http-errors';

import { GetPresignedUrlProvider } from './get-presigned-url.provider';
import { logger } from '../common/utils/logger.util';

jest.mock('@aws-sdk/client-s3');
jest.mock('@aws-sdk/s3-request-presigner');
jest.mock('../common/utils/logger.util');

describe('GetPresignedUrlProvider', () => {
  let getPresignedUrlProvider: GetPresignedUrlProvider;

  beforeEach(() => {
    getPresignedUrlProvider = new GetPresignedUrlProvider();
  });

  it('should generate a presigned URL successfully', async () => {
    const bucket = 'test-bucket';
    const key = 'test-key';
    const mockUrl = 'https://mock-presigned-url.com';

    (getSignedUrl as jest.Mock).mockResolvedValue(mockUrl);

    const result = await getPresignedUrlProvider.execute({ bucket, key });

    expect(S3Client).toHaveBeenCalledWith({
      endpoint: process.env.S3_ENDPOINT,
    });
    expect(getSignedUrl).toHaveBeenCalledWith(expect.any(S3Client), expect.any(GetObjectCommand), { expiresIn: 60 });
    expect(result).toBe(mockUrl);
  });

  it('should throw FailedDependency error if presigned URL generation fails', async () => {
    const bucket = 'test-bucket';
    const key = 'test-key';
    const error = new Error('Test error');

    (getSignedUrl as jest.Mock).mockRejectedValue(error);

    await expect(getPresignedUrlProvider.execute({ bucket, key })).rejects.toThrow(FailedDependency);

    expect(logger.error).toHaveBeenCalledWith({ error }, 'Fail to generate signed URL');
  });
});
