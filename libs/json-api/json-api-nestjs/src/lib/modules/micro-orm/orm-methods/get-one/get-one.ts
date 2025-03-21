import { NotFoundException } from '@nestjs/common';
import { ObjectLiteral, ValidateQueryError } from '../../../../types';
import { QueryOne } from '../../../mixin/zod';
import { MicroOrmService } from '../../service';
import { serialize, wrap } from '@mikro-orm/core';

export async function getOne<E extends ObjectLiteral>(
  this: MicroOrmService<E>,
  id: number | string,
  query: QueryOne<E>
): Promise<E> {
  const queryBuilder = this.microOrmUtilService.queryBuilder().where({
    [this.microOrmUtilService.currentPrimaryColumn]: id,
  });

  const resultItem = await this.microOrmUtilService
    .prePareQueryBuilder(queryBuilder, query)
    .getSingleResult();

  if (!resultItem) {
    const error: ValidateQueryError = {
      code: 'invalid_arguments',
      message: `Resource '${this.microOrmUtilService.currentAlias}' with id '${id}' does not exist`,
      path: ['fields'],
    };
    throw new NotFoundException([error]);
  }

  return wrap(resultItem).toJSON() as E;
}
