export interface Table {
  name: string;
  type: string;
}

export interface TablePreviewRequest {
  database_id: number;
  schema: string;
  table: string;
  columns: string[];
}

export interface TablePreviewResponse {
  columns: string[];
  data: Array<any[]>;
}
