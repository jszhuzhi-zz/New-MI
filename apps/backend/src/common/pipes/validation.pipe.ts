import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

/**
 * Global Validation Pipe.
 * Validates incoming request bodies against DTOs using class-validator decorators.
 * Returns detailed validation error messages.
 */
@Injectable()
export class GlobalValidationPipe implements PipeTransform<any> {
  private readonly logger = new Logger(GlobalValidationPipe.name);

  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value);
    const errors = await validate(object, {
      whitelist: true,
      forbidNonWhitelisted: true,
      skipMissingProperties: false,
    });

    if (errors.length > 0) {
      const formattedErrors = errors.map((error) => {
        const constraints = error.constraints || {};
        return {
          field: error.property,
          errors: Object.values(constraints),
          value: error.value,
        };
      });

      this.logger.debug(
        `Validation failed: ${JSON.stringify(formattedErrors)}`,
      );

      throw new BadRequestException({
        message: 'Validation failed',
        errors: formattedErrors,
      });
    }

    return object;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
