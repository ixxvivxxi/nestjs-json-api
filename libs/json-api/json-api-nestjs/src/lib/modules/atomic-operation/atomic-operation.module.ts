import { AsyncLocalStorage } from 'async_hooks';
import {
  DynamicModule,
  Inject,
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';

import { OperationController } from './controllers';
import { ExplorerService, ExecuteService, SwaggerService } from './service';

import {
  MapControllerEntity,
  MapEntityNameToEntity,
  ZodInputOperation,
  AsyncIterate,
} from './factory';
import { ResultModuleOptions } from '../../types';
import { MAP_CONTROLLER_INTERCEPTORS, OPTIONS } from './constants';

@Module({})
export class AtomicOperationModule implements NestModule {
  static forRoot(
    options: ResultModuleOptions,
    entityModules: DynamicModule[],
    commonModule: DynamicModule
  ): DynamicModule {
    return {
      module: AtomicOperationModule,
      controllers: [OperationController],
      providers: [
        ExplorerService,
        ExecuteService,
        SwaggerService,
        AsyncIterate,
        MapControllerEntity(options.entities, entityModules),
        MapEntityNameToEntity(options.entities),
        ZodInputOperation(),
        {
          provide: MAP_CONTROLLER_INTERCEPTORS,
          useValue: new Map(),
        },
        {
          provide: OPTIONS,
          useValue: options.options,
        },
        {
          provide: AsyncLocalStorage,
          useValue: new AsyncLocalStorage(),
        },
      ],
      imports: [DiscoveryModule, commonModule],
    };
  }
  @Inject(AsyncLocalStorage) private readonly als!: AsyncLocalStorage<any>;

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply((req: any, res: any, next: any) => {
        const store = {
          req: req,
          res: res,
          next: next,
        };
        this.als.run(store, () => next());
      })
      .forRoutes('*');
  }
}
