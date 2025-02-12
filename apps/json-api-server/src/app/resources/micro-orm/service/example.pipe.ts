import {
  ArgumentMetadata,
  BadRequestException,
  PipeTransform,
} from '@nestjs/common';

import { Query } from '@klerick/json-api-nestjs';
import { Users } from '@nestjs-json-api/microorm-database';

export class ExamplePipe implements PipeTransform<Query<Users>, Query<Users>> {
  transform(value: Query<Users>, metadata: ArgumentMetadata): Query<Users> {
    if (value.filter.target?.firstName?.eq === 'testCustomPipe') {
      const error = {
        code: 'invalid_arguments',
        message: `Custom query pipe error`,
        path: [],
      };
      throw new BadRequestException([error]);
    }
    return value;
  }
}
