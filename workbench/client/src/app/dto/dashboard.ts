import { FindQuery } from './query';

export enum ChartType {
  TABLE = 'table',
  BAR = 'bar',
  LINE = 'line',
  SCATTER = 'scatter',
  PIE = 'pie',
  MAP = 'map',
  // BUBBLE = 'bubble'
}

export const CHART_TYPES = Object.values(ChartType);

export interface BaseChartItem {
  title?: string;
  type: ChartType;
}

export interface ChartItemFields {
  x_column: string | null;
  y_column: string | null;
  min_y?: number | null;
  max_y?: number | null;
}

export interface MapChartItemFields {
  x_column: string | null;
  y_column: string | null;
  geo_column: string | null;
}

export interface TableItem extends BaseChartItem {
  type: ChartType.TABLE;
  columns?: string[];
}

export interface ChartItem extends BaseChartItem, ChartItemFields {
  type: ChartType.BAR | ChartType.LINE | ChartType.SCATTER | ChartType.PIE;
}

export interface MapItem extends BaseChartItem, MapChartItemFields {
  type: ChartType.MAP;
}

export interface BubbleChartItemFields extends ChartItemFields {
  z_column: string | null;
}

// export interface BubbleChartItem extends BaseChartItem, BubbleChartItemFields {
//   type: ChartType.BUBBLE;
// }

// export type DashboardItem = ChartItem | BubbleChartItem;
export type DashboardItem = TableItem | ChartItem | MapItem;

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

export type FindDashboardItem = { id: number; dashboard_id: number } & DashboardItem;

export interface FindDashboard extends Dashboard {
  id: number;
  created_at: string;
  updated_at: string;
  query: FindQuery;
  items: FindDashboardItem[];
}
