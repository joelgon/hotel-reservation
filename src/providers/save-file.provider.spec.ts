import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

import { SaveFileProvider } from './save-file.provider';
import { logger } from '../common/utils/logger.util';

jest.mock('@aws-sdk/client-s3');
jest.mock('../common/utils/logger.util');

describe('SaveFileProvider', () => {
  let saveFileProvider: SaveFileProvider;

  beforeEach(() => {
    saveFileProvider = new SaveFileProvider();
  });

  it('should save file successfully and return true when ETag is present', async () => {
    const bucket = 'test-bucket';
    const key = 'test-key';
    const fileContent = Buffer.from('test file content');
    const contentType = 'application/pdf';
    const mockResponse = { ETag: 'mock-etag' };

    (S3Client.prototype.send as jest.Mock).mockResolvedValue(mockResponse);

    const result = await saveFileProvider.execute({ file: fileContent, bucket, key, contentType });

    expect(S3Client).toHaveBeenCalledWith({
      endpoint: process.env.S3_ENDPOINT,
    });
    expect(S3Client.prototype.send).toHaveBeenCalledWith(expect.any(PutObjectCommand));
    expect(result).toBe(true);
  });

  it('should return false if no ETag is returned', async () => {
    const bucket = 'test-bucket';
    const key = 'test-key';
    const fileContent = Buffer.from('test file content');
    const contentType = 'application/pdf';
    const mockResponse = {};

    (S3Client.prototype.send as jest.Mock).mockResolvedValue(mockResponse);

    const result = await saveFileProvider.execute({ file: fileContent, bucket, key, contentType });

    expect(S3Client.prototype.send).toHaveBeenCalledWith(expect.any(PutObjectCommand));
    expect(result).toBe(false);
  });

  it('should log an error and return false if an exception occurs', async () => {
    const bucket = 'test-bucket';
    const key = 'test-key';
    const fileContent = Buffer.from('test file content');
    const contentType = 'application/pdf';
    const error = new Error('Test error');

    (S3Client.prototype.send as jest.Mock).mockRejectedValue(error);

    const result = await saveFileProvider.execute({ file: fileContent, bucket, key, contentType });

    expect(logger.error).toHaveBeenCalledWith({ error }, 'Fail to save file in S3');
    expect(result).toBe(false);
  });
});
