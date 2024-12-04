import { Column } from './column';

export interface Table {
  name: string;
  type: string;
  columns: Column[];
}

export interface TablePreviewRequest {
  database_id: number;
  schema: string;
  table: string;
  columns: string[];
}

export interface TablePreviewResponse {
  columns: string[];
  types: string[];
  data: Array<any[]>;
}
