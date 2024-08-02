import { RunQuery } from '../dto';
import { TABLE_PREVIEW } from './table-preview';

export const RUN_QUERY: RunQuery = {
  ...TABLE_PREVIEW,
  execution_time: 2.123
};
