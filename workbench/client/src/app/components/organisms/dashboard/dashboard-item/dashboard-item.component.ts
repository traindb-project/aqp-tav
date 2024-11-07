import { Component, input } from '@angular/core';
import { ChartType, DashboardItem } from '../../../../dto';
import { ColumnToAxisDataPipe } from '../../../../pipes';
import { BarChartComponent } from '../../charts';
import { LineChartComponent } from '../../charts/line-chart/line-chart.component';

@Component({
  selector: 'etri-dashboard-item',
  standalone: true,
  styleUrls: ['dashboard-item.component.scss'],
  templateUrl: 'dashboard-item.component.html',
  imports: [
    BarChartComponent,
    ColumnToAxisDataPipe,
    LineChartComponent
  ]
})
export class DashboardItemComponent {
  item = input.required<DashboardItem>();
  columns = input<string[]>([]);
  data = input<Array<any[]>>([]);
  protected readonly ChartType = ChartType;
}
