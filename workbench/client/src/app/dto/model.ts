import { Column } from './column';

export interface JoinColumn {
  schema: string;
  table: string;
  columns: string;
}

export type ModelJoinColumn = [JoinColumn, JoinColumn];

export interface ModelTable {
  name: string;
  columns: string[];
}

export interface ModelSchema {
  schema: string;
  table: ModelTable;
}

export interface Model {
  name: string;
  modeltype: string;
  schemas: ModelSchema[];
  on: ModelJoinColumn[];
  table_rows: number;
  trained_rows: number;
  status: string;
  server: string | null;
  start: string | null;
  training_status: string | null;
  options: any;
}

export interface UpdateModel {
  name: string | null;
  status: string | null;
}

export interface TrainModelOption {
  name: string;
  value: string;
}

export interface TrainModel {
  name: string;
  database_id: number;
  schema: string;
  table: string;
  columns: string[];
  modeltype: string;
  sample: string | null;
  options: TrainModelOption[];
}
