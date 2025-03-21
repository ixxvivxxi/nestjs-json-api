import { getDataSourceToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { IMemoryDb } from 'pg-mem';
import { Repository } from 'typeorm';

import {
  Addresses,
  Comments,
  entities,
  getRepository,
  mockDBTestModule,
  Notes,
  providerEntities,
  pullAllData,
  Roles,
  UserGroups,
  Users,
} from '../../../../mock-utils/typeorm';

import {
  CONTROL_OPTIONS_TOKEN,
  CURRENT_ENTITY,
  DEFAULT_CONNECTION_NAME,
  ORM_SERVICE,
} from '../../../../constants';
import {
  CurrentDataSourceProvider,
  CurrentEntityManager,
  CurrentEntityRepository,
  EntityPropsMap,
  OrmServiceFactory,
} from '../../factory';
import { JsonApiTransformerService } from '../../../mixin/service/json-api-transformer.service';
import { TypeOrmService, TypeormUtilsService } from '../../service';
import { createAndPullSchemaBase } from '../../../../mock-utils';

describe('deleteRelationship', () => {
  let db: IMemoryDb;
  let typeormService: TypeOrmService<Users>;
  let transformDataService: JsonApiTransformerService<Users>;
  let typeormUtilsService: TypeormUtilsService<Users>;
  let userRepository: Repository<Users>;
  let addressesRepository: Repository<Addresses>;
  let notesRepository: Repository<Notes>;
  let commentsRepository: Repository<Comments>;
  let rolesRepository: Repository<Roles>;
  let userGroupRepository: Repository<UserGroups>;

  beforeAll(async () => {
    db = createAndPullSchemaBase();
    const module: TestingModule = await Test.createTestingModule({
      imports: [mockDBTestModule(db)],
      providers: [
        ...providerEntities(getDataSourceToken()),
        CurrentDataSourceProvider(DEFAULT_CONNECTION_NAME),
        {
          provide: CONTROL_OPTIONS_TOKEN,
          useValue: {
            requiredSelectField: false,
            debug: false,
          },
        },
        {
          provide: CURRENT_ENTITY,
          useValue: Users,
        },
        EntityPropsMap(entities as any),
        CurrentEntityManager(),
        CurrentEntityRepository(Users),
        TypeormUtilsService,
        JsonApiTransformerService,
        OrmServiceFactory(),
      ],
    }).compile();
    ({
      userRepository,
      addressesRepository,
      notesRepository,
      commentsRepository,
      rolesRepository,
      userGroupRepository,
    } = getRepository(module));
    await pullAllData(
      userRepository,
      addressesRepository,
      notesRepository,
      commentsRepository,
      rolesRepository,
      userGroupRepository
    );
    typeormService = module.get<TypeOrmService<Users>>(ORM_SERVICE);
    transformDataService = module.get<JsonApiTransformerService<Users>>(
      JsonApiTransformerService
    );
    typeormUtilsService =
      module.get<TypeormUtilsService<Users>>(TypeormUtilsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('Should be ok', async () => {
    const checkUser = await userRepository.findOne({
      select: {
        id: true,
        roles: {
          id: true,
        },
        userGroup: {
          id: true,
        },
        manager: {
          id: true,
        },
      },
      where: { id: 1 },
      relations: {
        roles: true,
        manager: true,
        userGroup: true,
      },
    });

    const roles = await rolesRepository.find();
    const userGroups = await userGroupRepository.find();
    const users = await userRepository.find();

    if (!checkUser) {
      throw new Error('not found mock');
    }

    const userGroupData = {
      type: 'user-groups',
      id: userGroups
        .find((i) => checkUser.userGroup.id === i.id)
        ?.id.toString(),
    };
    const rolesData = [
      {
        type: 'roles',
        id: roles
          .find((i) => checkUser.roles.find((a) => a.id === i.id))
          ?.id.toString(),
      },
    ];

    const managerData = {
      type: 'users',
      id: users.find((i) => checkUser.manager.id === i.id)?.id.toString(),
    };
    await typeormService.deleteRelationship(1, 'roles', rolesData as any);
    await typeormService.deleteRelationship(
      1,
      'userGroup',
      userGroupData as any
    );
    await typeormService.deleteRelationship(1, 'manager', managerData as any);

    const checkUserAfterPost = await userRepository.findOne({
      select: {
        id: true,
        roles: {
          id: true,
        },
        userGroup: {
          id: true,
        },
        manager: {
          id: true,
        },
      },
      where: { id: 1 },
      relations: {
        roles: true,
        manager: true,
        userGroup: true,
      },
    });
    if (!checkUserAfterPost) {
      throw new Error('not found');
    }
    expect(checkUserAfterPost.manager).toBe(null);
    expect(checkUserAfterPost.roles.map((i) => i.id.toString()).sort()).toEqual(
      checkUser.roles
        .map((i) => i.id.toString())
        .filter((i) => !rolesData.map((i) => i.id).includes(i))
        .sort()
    );
    expect(checkUserAfterPost.userGroup).toBe(null);
  });
});
