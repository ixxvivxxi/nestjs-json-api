import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { DeepPartial } from 'typeorm';
import {
  ResourceObject,
  ObjectTyped,
  QueryField,
} from '../../../../utils/nestjs-shared';

import { ObjectLiteral, ValidateQueryError } from '../../../../types';
import { PatchData, Query } from '../../../mixin/zod';
import { TypeOrmService } from '../../service';

export async function patchOne<E extends ObjectLiteral>(
  this: TypeOrmService<E>,
  id: number | string,
  inputData: PatchData<E>
): Promise<ResourceObject<E>> {
  const { id: idBody, attributes, relationships } = inputData;

  if (`${id}` !== idBody) {
    const error: ValidateQueryError = {
      code: 'invalid_arguments',
      message: `Data 'id' must be equal to url param`,
      path: ['data', 'id'],
    };

    throw new UnprocessableEntityException([error]);
  }

  const paramsId = 'paramsId';
  const result = await this.repository
    .createQueryBuilder()
    .where(
      `${this.typeormUtilsService.getAliasPath(
        this.typeormUtilsService.currentPrimaryColumn
      )} = :${paramsId}`,
      {
        [paramsId]: id,
      }
    )
    .getOne();

  if (!result) {
    const error: ValidateQueryError = {
      code: 'invalid_arguments',
      message: `Resource '${this.typeormUtilsService.currentAlias}' with id '${id}' does not exist`,
      path: ['data', 'id'],
    };
    throw new NotFoundException([error]);
  }

  if (attributes) {
    const entityTarget = this.repository.manager.create(
      this.repository.target,
      attributes as DeepPartial<E>
    );
    for (const [props, val] of ObjectTyped.entries(entityTarget)) {
      result[props] = val;
    }
  }

  const saveData = await this.typeormUtilsService.saveEntityData(
    result,
    relationships
  );

  const fakeQuery: Query<E> = {
    [QueryField.fields]: null,
    [QueryField.include]: Object.keys(relationships || {}),
  } as any;

  const { data, included } = this.transformDataService.transformData(
    saveData,
    fakeQuery
  );
  const includeData = included ? { included } : {};
  return {
    meta: {},
    data,
    ...includeData,
  };
}
