import { compare } from 'bcryptjs';

import { CompareHashProvider } from './compare-hash.provider';

jest.mock('bcryptjs');

describe('CompareHashProvider', () => {
  let compareHashProvider: CompareHashProvider;

  beforeEach(() => {
    compareHashProvider = new CompareHashProvider();
  });

  it('should return true if password matches the hash', async () => {
    const password = 'plain_password';
    const passwordHash = 'hashed_password';

    (compare as jest.Mock).mockImplementation((_, __, callback) => {
      callback(null, true);
    });

    const result = await compareHashProvider.execute(password, passwordHash);

    expect(result).toBe(true);
    expect(compare).toHaveBeenCalledWith(password, passwordHash, expect.any(Function));
  });

  it('should return false if password does not match the hash', async () => {
    const password = 'plain_password';
    const passwordHash = 'hashed_password';

    (compare as jest.Mock).mockImplementation((_, __, callback) => {
      callback(null, false);
    });

    const result = await compareHashProvider.execute(password, passwordHash);

    expect(result).toBe(false);
    expect(compare).toHaveBeenCalledWith(password, passwordHash, expect.any(Function));
  });

  it('should throw an error if compare function fails', async () => {
    const password = 'plain_password';
    const passwordHash = 'hashed_password';

    const error = new Error('Test error');

    (compare as jest.Mock).mockImplementation((_, __, callback) => {
      callback(error, null);
    });

    await expect(compareHashProvider.execute(password, passwordHash)).rejects.toThrow(error);
    expect(compare).toHaveBeenCalledWith(password, passwordHash, expect.any(Function));
  });
});
