import { Database } from './database';
import { TrainDB } from './traindb';

export enum QueryType {
  SQL = 'sql',
  APPROXIMATE = 'approximate',
  INCREMENTAL = 'incremental',
}

export interface Query {
  name: string;
  traindb_id: number;
  database_id: number;
  query_type: QueryType;
  sql: string;
}

export interface FindQuery extends Query {
  id: number;
  traindb: TrainDB;
  database: Database;
  created_at: Date;
  updated_at: Date;
}

export interface RunQuery {
  columns: string[];
  types: string[];
  data: Array<any[]>;
  execution_time: number;
}

export interface CreateQuery extends Query { }

export interface UpdateQuery extends Query { }
