import { FindQuery } from './query';

export enum ChartType {
  BAR = 'bar',
  LINE = 'line',
  SCATTER = 'scatter',
  PIE = 'pie',
  BUBBLE = 'bubble'
}

export const CHART_TYPES = Object.values(ChartType);

export interface BaseChartItem {
  type: ChartType;
}

export interface ChartItemFields {
  x_column: string | null;
  y_column: string | null;
}

export interface ChartItem extends BaseChartItem, ChartItemFields {
  type: ChartType.BAR | ChartType.LINE | ChartType.SCATTER | ChartType.PIE;
}

export interface BubbleChartItemFields extends ChartItemFields {
  z_column: string | null;
}

export interface BubbleChartItem extends BaseChartItem, BubbleChartItemFields {
  type: ChartType.BUBBLE;
}

export type DashboardItem = ChartItem | BubbleChartItem;

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
  query: FindQuery;
  items: FindDashboardItem[];
}
