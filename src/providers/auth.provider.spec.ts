import { Unauthorized } from 'http-errors';
import * as jsonWebToken from 'jsonwebtoken';

import { AuthProvider } from './auth.provider';
import { logger } from '../common/utils/logger.util';

jest.mock('jsonwebtoken');
jest.mock('../common/utils/logger.util');

describe('AuthProvider', () => {
  const customerId = 'test_customer_id';
  const token = 'test_token';
  let authProvider: AuthProvider;

  beforeEach(() => {
    jest.clearAllMocks();
    authProvider = new AuthProvider();
  });

  describe('sign', () => {
    it('should sign a token with the given customerId', () => {
      const signMock = jsonWebToken.sign as jest.Mock;
      signMock.mockReturnValue(token);

      const result = authProvider.sign(customerId);

      expect(signMock).toHaveBeenCalledWith({ customerId }, expect.any(String), { expiresIn: '1h' });
      expect(result).toBe(token);
    });
  });

  describe('verify', () => {
    it('should verify the token and return the payload', () => {
      const verifyMock = jsonWebToken.verify as jest.Mock;
      verifyMock.mockReturnValue({ customerId });

      const result = authProvider.verify(token);

      expect(verifyMock).toHaveBeenCalledWith(token, expect.any(String));
      expect(result).toEqual({ customerId });
    });

    it('should log an error and throw Unauthorized on verification failure', () => {
      const verifyMock = jsonWebToken.verify as jest.Mock;
      const error = new Error('Token verification failed');
      verifyMock.mockImplementation(() => {
        throw error;
      });

      const loggerMock = logger.error as jest.Mock;

      expect(() => authProvider.verify(token)).toThrow(Unauthorized);
      expect(loggerMock).toHaveBeenCalledWith({ error }, 'AuthProvider');
    });
  });
});
