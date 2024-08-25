import { plainToClass } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { BadRequest } from 'http-errors';

export class DtoValidator {
  static async validate<T extends object = any>(dtoClass: new () => T, plainObject: object): Promise<T> {
    const dtoInstance = plainToClass(dtoClass, plainObject);
    const errors: ValidationError[] = await validate(dtoInstance, { forbidNonWhitelisted: true, forbidUnknownValues: true });

    if (errors.length > 0)
      throw new BadRequest(`Validation failed: ${this.formatErrors(errors)}`)

    return dtoInstance;
  }

  private static formatErrors(errors: ValidationError[]): string {
    return errors
      .map(error => Object.values(error.constraints ?? {}).join(', '))
      .join('; ');
  }
}