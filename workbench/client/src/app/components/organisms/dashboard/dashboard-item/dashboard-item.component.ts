import { DecimalPipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';

import { ChartItem, ChartType, DashboardItem, MapItem, TableItem } from '../../../../dto';
import { ColumnToAxisDataPipe, FilterColumnsPipe, FilterSelectedRowsPipe } from '../../../../pipes';
import {
  BarChartComponent,
  LineChartComponent,
  MapChartComponent,
  PieChartComponent,
  ScatterChartComponent,
} from '../../charts';

@Component({
  imports: [
    BarChartComponent,
    ColumnToAxisDataPipe,
    LineChartComponent,
    PieChartComponent,
    ScatterChartComponent,
    DecimalPipe,
    MapChartComponent,
    FilterColumnsPipe,
    FilterSelectedRowsPipe
  ],
  selector: 'etri-dashboard-item',
  styleUrls: ['dashboard-item.component.scss'],
  templateUrl: 'dashboard-item.component.html'
})
export class DashboardItemComponent {
  item = input.required<DashboardItem>();
  chartItem = computed(() => this.item() as ChartItem);
  mapItem = computed(() => this.item() as MapItem);
  tableItem = computed(() => this.item() as TableItem);
  columns = input<string[]>([]);
  data = input<Array<any[]>>([]);
  protected readonly ChartType = ChartType;

  isNumber(item: any) {
    return !isNaN(+item);
  }
}
