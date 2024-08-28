import { genSalt, hash } from 'bcryptjs';

export class EncriptionProvider {
  async execute(password: string): Promise<string> {
    const saltRounds = 10;

    const salt = await new Promise<string>((resolve, reject) =>
      genSalt(saltRounds, (err, salt) => {
        if (err) return reject(err);

        return resolve(salt);
      })
    );

    return new Promise<string>((resolve, reject) =>
      hash(password, salt, (err, hash) => {
        if (err) return reject(err);

        return resolve(hash);
      })
    );
  }
}
