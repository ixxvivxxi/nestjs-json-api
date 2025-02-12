import {
  Inject,
  PipeTransform,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ZodError } from 'zod';
import { errorMap } from 'zod-validation-error';
import { ZOD_INPUT_QUERY_SCHEMA } from '../../../../constants';
import { ZodInputQuery, InputQuery } from '../../zod';
import { JSONValue } from '../../types';
import { ObjectLiteral } from '../../../../types';

export class QueryInputPipe<E extends ObjectLiteral>
  implements PipeTransform<JSONValue, InputQuery<E>>
{
  @Inject(ZOD_INPUT_QUERY_SCHEMA)
  private zodInputQuerySchema!: ZodInputQuery<E>;

  transform(value: JSONValue): InputQuery<E> {
    try {
      return this.zodInputQuerySchema.parse(value, {
        errorMap: errorMap,
      });
    } catch (e) {
      if (e instanceof ZodError) {
        throw new BadRequestException(e.issues);
      }

      throw new InternalServerErrorException(e);
    }
  }
}
