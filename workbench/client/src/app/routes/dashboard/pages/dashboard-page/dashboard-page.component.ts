import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';

import { DashboardButtonComponent, DashboardItemsComponent } from '../../../../components';
import { ChartType, FindDashboard } from '../../../../dto';
import { DashboardService, TraindbService } from '../../../../services';

@Component({
  host: {
    class: 'page',
  },
  imports: [
    DashboardButtonComponent,
    RouterLink,
    DashboardItemsComponent
  ],
  selector: 'etri-dashboard-page',
  styleUrls: ['dashboard-page.component.scss'],
  templateUrl: 'dashboard-page.component.html'
})
export class DashboardPageComponent implements OnInit {
  readonly dashboards = signal<FindDashboard[]>([]);
  protected readonly ChartType = ChartType;
  private readonly traindbService = inject(TraindbService);
  private readonly dashboardService = inject(DashboardService);

  deleteDashboard(id: number) {
    if (!confirm('대시보드를 삭제하시겠습니까?')) return;
    this.dashboardService.deleteDashboard(id).pipe(
      switchMap(() => {
        const traindbId = this.traindbService.currentId()!;
        return this.dashboardService.searchDashboard(traindbId);
      }),
    ).subscribe({
      next: dashboards => {
        this.dashboards.set(dashboards);
      },
      error: err => {
        console.error(err);
      },
    })
  }

  ngOnInit(): void {
    const traindbId = this.traindbService.currentId()!;
    this.dashboardService.searchDashboard(traindbId).subscribe({
      next: dashboards => {
        dashboards.sort((a, b) => a.updated_at > b.updated_at ? -1 : 1);
        this.dashboards.set(dashboards);
      },
      error: err => {
        console.error(err);
      },
    });
  }
}
