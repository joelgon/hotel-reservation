import { compare } from "bcryptjs";

export class CompareHash {
    async execute(password: string, passwordHash: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => compare(password, passwordHash, (err, result) => {
            if (err) return reject(err);

            return resolve(result);
        }))
    }
}