import { Test, TestingModule } from '@nestjs/testing';
import { UnprocessableEntityException } from '@nestjs/common';
import { ParseRelationshipNamePipe } from './parse-relationship-name.pipe';
import { CURRENT_ENTITY, CHECK_RELATION_NAME } from '../../../../constants';
import { EntityTarget } from 'typeorm/common/EntityTarget';

describe('CheckItemEntityPipe', () => {
  let pipe: ParseRelationshipNamePipe<any, any>;
  let checkRelationNameMock: jest.Mock;
  let mockEntityTarget: EntityTarget<any>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParseRelationshipNamePipe,
        { provide: CURRENT_ENTITY, useValue: {} },
        { provide: CHECK_RELATION_NAME, useValue: jest.fn() },
      ],
    }).compile();

    pipe = module.get<ParseRelationshipNamePipe<any, any>>(
      ParseRelationshipNamePipe
    );
    mockEntityTarget = module.get<EntityTarget<any>>(CURRENT_ENTITY);
    checkRelationNameMock = module.get<jest.Mock>(CHECK_RELATION_NAME);
  });

  it('should call findOneRowEntity and return the entity', async () => {
    const mockValue = 'name';

    checkRelationNameMock.mockReturnValueOnce(true);
    const result = await pipe.transform(mockValue);

    expect(checkRelationNameMock).toHaveBeenCalledTimes(1);
    expect(checkRelationNameMock).toHaveBeenCalledWith(
      mockEntityTarget,
      mockValue
    );

    expect(result).toBe(mockValue);
  });

  it('should throw a UnprocessableEntityException if no entity is found', async () => {
    const mockValue = 'name';

    checkRelationNameMock.mockReturnValueOnce(false);

    expect(() => pipe.transform(mockValue)).toThrow(
      UnprocessableEntityException
    );

    expect(checkRelationNameMock).toHaveBeenCalledTimes(1);
    expect(checkRelationNameMock).toHaveBeenCalledWith(
      mockEntityTarget,
      mockValue
    );
  });
});
