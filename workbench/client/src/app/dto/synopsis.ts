export interface Synopsis {
  name: string;
  model: string;
  schema: string;
  table: string;
  columns: string[];
  rows: number;
  ratio: string;
  external: string;
  status: string;
  statistics: string;
}

export interface CreateSynopsis {
  name: string;
  model: string;
  limit_rows: string;
  is_percent: boolean | null;
}

export interface UpdateSynopsis {
  name: string | null;
  status: string | null;
}
