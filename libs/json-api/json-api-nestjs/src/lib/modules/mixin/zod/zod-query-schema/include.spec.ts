import { zodIncludeQuery } from './include';
import { ResultGetField } from '../../types';
import { Users } from '../../../../mock-utils';

const relationList: ResultGetField<Users>['relations'] = [
  'userGroup',
  'notes',
  'comments',
  'roles',
  'manager',
  'addresses',
];
const schema = zodIncludeQuery<Users>(relationList);

describe('zodIncludeQuery', () => {
  it('should validate an array of relations successfully', () => {
    const result = schema.parse(['comments', 'addresses']);

    expect(result).toEqual(['comments', 'addresses']);
  });

  it('should return null if input is null', () => {
    const result = schema.parse(null);

    expect(result).toBeNull();
  });

  it('should throw an error if the array is empty', () => {
    expect(() => schema.parse([])).toThrowError(
      expect.objectContaining({
        message: expect.stringContaining(
          'Array must contain at least 1 element'
        ),
      })
    );
  });

  it('should throw an error if the array has duplicate entries', () => {
    expect(() => schema.parse(['addresses', 'addresses'])).toThrowError(
      expect.objectContaining({
        message: expect.stringContaining('Include should have unique relation'),
      })
    );
  });

  it('should throw an error if the input contains invalid relations', () => {
    expect(() => schema.parse(['invalid_relation'])).toThrowError(
      expect.objectContaining({
        message: expect.stringContaining('Invalid enum value. Expected'),
      })
    );
  });
});
