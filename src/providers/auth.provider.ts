import { Unauthorized } from 'http-errors';
import * as jsonWebToken from 'jsonwebtoken';
import { Logger } from 'pino';

import { logger } from '../common/utils/logger.util';

export class AuthProvider {
  private readonly secret = process.env.JWT_SECRET ?? 'default_secret';
  private readonly logger: Logger;

  constructor() {
    this.logger = logger;
  }

  sign(customerId: string): string {
    return jsonWebToken.sign({ customerId }, this.secret, { expiresIn: '1h' });
  }

  verify(token: string): { customerId: string } {
    try {
      return jsonWebToken.verify(token, this.secret) as { customerId: string };
    } catch (error) {
      this.logger.error({ error }, AuthProvider.name);
      throw new Unauthorized();
    }
  }
}
