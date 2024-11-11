import { JsonPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { BarChartComponent, DashboardButtonComponent, DashboardItemsComponent } from '../../../../components';
import { LineChartComponent } from '../../../../components/organisms/charts/line-chart/line-chart.component';
import { ChartType, FindDashboard } from '../../../../dto';
import { ColumnToAxisDataPipe } from '../../../../pipes';
import { DashboardService, TraindbService } from '../../../../services';

@Component({
  host: {
    class: 'page',
  },
  selector: 'etri-dashboard-page',
  standalone: true,
  styleUrls: ['dashboard-page.component.scss'],
  templateUrl: 'dashboard-page.component.html',
  imports: [
    DashboardButtonComponent,
    RouterLink,
    JsonPipe,
    BarChartComponent,
    ColumnToAxisDataPipe,
    LineChartComponent,
    DashboardItemsComponent
  ]
})
export class DashboardPageComponent implements OnInit {
  readonly dashboards = signal<FindDashboard[]>([]);
  private readonly traindbService = inject(TraindbService);
  private readonly dashboardService = inject(DashboardService);
  protected readonly ChartType = ChartType;

  deleteDashboard(id: number) {
    if (!confirm('대시보드를 삭제하시겠습니까?')) return;
    this.dashboardService.deleteDashboard(id).pipe(
      switchMap(() => {
        const traindbId = this.traindbService.currentId()!;
        return this.dashboardService.searchDashboard(traindbId);
      }),
    ).subscribe({
      next: dashboards => this.dashboards.set(dashboards),
      error: err => {
        console.error(err);
      },
    })
  }

  ngOnInit(): void {
    const traindbId = this.traindbService.currentId()!;
    this.dashboardService.searchDashboard(traindbId).subscribe({
      next: dashboards => this.dashboards.set(dashboards)
    })
  }
}
