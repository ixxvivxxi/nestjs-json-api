import { IsolationLevel } from 'typeorm/driver/types/IsolationLevel';
import { FilterOperand } from '../../utils/nestjs-shared';
export type TypeOrmParam = {
  useSoftDelete?: boolean;
  runInTransaction?: <Func extends (...args: any) => any>(
    isolationLevel: IsolationLevel,
    fn: Func
  ) => ReturnType<Func>;
};

export const EXPRESSION = 'EXPRESSION';
export const OperandsMapExpression = {
  [FilterOperand.eq]: `= :${EXPRESSION}`,
  [FilterOperand.ne]: `<> :${EXPRESSION}`,
  [FilterOperand.regexp]: `~* :${EXPRESSION}`,
  [FilterOperand.gt]: `> :${EXPRESSION}`,
  [FilterOperand.gte]: `>= :${EXPRESSION}`,
  [FilterOperand.in]: `IN (:...${EXPRESSION})`,
  [FilterOperand.ilike]: `ILIKE :${EXPRESSION}`,
  [FilterOperand.like]: `LIKE :${EXPRESSION}`,
  [FilterOperand.lt]: `< :${EXPRESSION}`,
  [FilterOperand.lte]: `<= :${EXPRESSION}`,
  [FilterOperand.nin]: `NOT IN (:...${EXPRESSION})`,
  [FilterOperand.some]: `&& :${EXPRESSION}`,
};

export const OperandMapExpressionForNull = {
  [FilterOperand.ne]: 'IS NOT NULL',
  [FilterOperand.eq]: 'IS NULL',
};

export const OperandsMapExpressionForNullRelation = {
  [FilterOperand.ne]: `EXISTS ${EXPRESSION}`,
  [FilterOperand.eq]: `NOT EXISTS ${EXPRESSION}`,
};
