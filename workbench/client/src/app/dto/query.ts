import { Database } from './database';
import { TrainDB } from './traindb';

export interface Query {
  name: string;
  traindb_id: number;
  database_id: number;
  is_approximate: boolean;
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

export interface CreateQuery extends Query {}

export interface UpdateQuery extends Query {}
