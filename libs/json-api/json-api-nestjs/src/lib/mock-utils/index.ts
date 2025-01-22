import { TypeOrmModule } from '@nestjs/typeorm';
import { DynamicModule } from '@nestjs/common';
import { DataType, IMemoryDb, newDb } from 'pg-mem';
import { readFileSync } from 'fs';
import { join } from 'path';

import {
  Users,
  Roles,
  RequestsHavePodLocks,
  Requests,
  Pods,
  Comments,
  Addresses,
  UserGroups,
  Notes,
} from './entities';
import { DataSource } from 'typeorm';

import { v4 } from 'uuid';

export * from './entities';
export * from './utils';

export const entities = [
  Users,
  UserGroups,
  Roles,
  RequestsHavePodLocks,
  Requests,
  Pods,
  Comments,
  Addresses,
  Notes,
];

export function createAndPullSchemaBase(): IMemoryDb {
  const dump = readFileSync(join(__dirname, 'db-for-test'), {
    encoding: 'utf8',
  });
  const db = newDb({
    autoCreateForeignKeyIndices: true,
  });

  db.public.registerFunction({
    name: 'current_database',
    implementation: () => 'test',
  });

  db.public.registerFunction({
    name: 'version',
    implementation: () =>
      'PostgreSQL 12.5 on x86_64-pc-linux-musl, compiled by gcc (Alpine 10.2.1_pre1) 10.2.1 20201203, 64-bit',
  });

  db.registerExtension('uuid-ossp', (schema) => {
    schema.registerFunction({
      name: 'uuid_generate_v4',
      returns: DataType.uuid,
      implementation: v4,
      impure: true,
    });
  });
  db.public.none(dump);
  return db;
}
export function mockDBTestModule(db: IMemoryDb): DynamicModule {
  return TypeOrmModule.forRootAsync({
    useFactory() {
      return {
        type: 'postgres',
        // logging: true,
        entities: [
          Users,
          UserGroups,
          Roles,
          RequestsHavePodLocks,
          Requests,
          Pods,
          Comments,
          Addresses,
          Notes,
        ],
      };
    },
    async dataSourceFactory(options) {
      const dataSource: DataSource = await db.adapters.createTypeormDataSource(
        options
      );

      return dataSource;
    },
  });
}
