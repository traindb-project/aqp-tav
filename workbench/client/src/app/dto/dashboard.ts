import { FindQuery } from './query';

export enum ChartType {
  BAR = 'bar',
  LINE = 'line',
  SCATTER = 'scatter',
  PIE = 'pie',
}

export interface DashboardItem {
  x_column: string;
  y_column: string;
  type: ChartType;
}

export interface Dashboard {
  name: string;
  traindb_id: number;
  query_id: number;
}

export interface CreateDashboard extends Dashboard {
  items: DashboardItem[];
}

export interface UpdateDashboard extends Dashboard {
  items: DashboardItem[];
}

export interface FindDashboardItem extends DashboardItem {
  id: number;
  dashboard_id: number;
}

export interface FindDashboard extends Dashboard {
  id: number;
  query: FindQuery;
  items: FindDashboardItem[];
}
