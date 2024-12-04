import { FindQuery, QueryType } from '../dto';
import { DATABASE_LIST } from './databases';
import { TRAINDB_LIST } from './traindb';

export const QUERY_LIST: FindQuery[] = [
  {
    id: 1,
    name: '근사질의 테스트',
    traindb_id: 1,
    database_id: 1,
    query_type: QueryType.APPROXIMATE,
    sql: 'SELECT APPROXIMATE reordered FROM instacart.order_products',
    traindb: TRAINDB_LIST[0],
    database: DATABASE_LIST[0],
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 2,
    name: '정확질의 테스트',
    traindb_id: 1,
    database_id: 2,
    query_type: QueryType.SQL,
    sql: 'SELECT reordered FROM instacart.order_products',
    traindb: TRAINDB_LIST[1],
    database: DATABASE_LIST[1],
    created_at: new Date(),
    updated_at: new Date(),
  },
];
