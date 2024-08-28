import { genSalt, hash } from 'bcryptjs';
import { EncriptionProvider } from './encription.provider';

jest.mock('bcryptjs');

describe('EncriptionProvider', () => {
  let encriptionProvider: EncriptionProvider;

  beforeEach(() => {
    encriptionProvider = new EncriptionProvider();
  });

  it('should generate a hash for the given password', async () => {
    const password = 'plain_password';
    const salt = 'test_salt';
    const hashedPassword = 'hashed_password';

    (genSalt as jest.Mock).mockImplementation((_, callback) => {
      callback(null, salt);
    });

    (hash as jest.Mock).mockImplementation((_, __, callback) => {
      callback(null, hashedPassword);
    });

    const result = await encriptionProvider.execute(password);

    expect(result).toBe(hashedPassword);
    expect(genSalt).toHaveBeenCalledWith(10, expect.any(Function));
    expect(hash).toHaveBeenCalledWith(password, salt, expect.any(Function));
  });

  it('should throw an error if genSalt fails', async () => {
    const password = 'plain_password';
    const error = new Error('Test genSalt error');

    (genSalt as jest.Mock).mockImplementation((_, callback) => {
      callback(error, null);
    });

    await expect(encriptionProvider.execute(password)).rejects.toThrow(error);
    expect(genSalt).toHaveBeenCalledWith(10, expect.any(Function));
  });

  it('should throw an error if hash fails', async () => {
    const password = 'plain_password';
    const salt = 'test_salt';
    const error = new Error('Test hash error');

    (genSalt as jest.Mock).mockImplementation((_, callback) => {
      callback(null, salt);
    });

    (hash as jest.Mock).mockImplementation((_, __, callback) => {
      callback(error, null);
    });

    await expect(encriptionProvider.execute(password)).rejects.toThrow(error);
    expect(genSalt).toHaveBeenCalledWith(10, expect.any(Function));
    expect(hash).toHaveBeenCalledWith(password, salt, expect.any(Function));
  });
});
