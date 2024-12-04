import { FindTrainDBDto } from './traindb';

export interface Database {
  dbms: string;
  host: string;
  port: number | string;
  username: string | null;
  password: string | null;
  database: string | null;
}

export interface FindDatabase extends Database {
  id: number;
  name: string;
  traindb_id: number;
  traindb: FindTrainDBDto;
  created_at: Date;
  updated_at: Date;
}

export interface TestDatabaseConnectionRequest extends Omit<Database, 'name' | 'traindb_id'> {
  server_host: string | null;
  server_port: number | string | null;
}

export interface TestDatabaseConnectionResponse {
  success: boolean;
}

export interface CreateDatabase extends Database {
  name: string;
  traindb_id: number;
}

export interface UpdateDatabase extends Database {
  name: string;
  traindb_id: number;
}
