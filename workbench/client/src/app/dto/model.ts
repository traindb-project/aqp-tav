export interface Model {
  name: string;
  modeltype: string;
  schema: string;
  table: string;
  columns: string[];
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
