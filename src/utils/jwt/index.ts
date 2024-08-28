import * as jsonWebToken from 'jsonwebtoken';
import { Unauthorized } from 'http-errors';

export class JsonWebToken {
    private readonly secret = process.env.JWT_SECRET ?? 'default_secret'

    sign(customerId: string): string {
        return jsonWebToken.sign({ customerId }, this.secret, { expiresIn: '1h' })
    }

    verify(token: string): { customerId: string } {
        try {
            return jsonWebToken.verify(token, this.secret) as { customerId: string }
        } catch (error) {
            throw new Unauthorized(); 
        }
    }
}