import { Component, computed, inject, input, output, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { DashboardItem, FindQuery } from '../../../../dto';
import { QueryService } from '../../../../services';
import { LoadingComponent, PlayIconComponent, TrashIconComponent } from '../../../atoms';
import { DashboardItemComponent } from '../dashboard-item';

@Component({
    imports: [
        PlayIconComponent,
        DashboardItemComponent,
        LoadingComponent,
        TrashIconComponent
    ],
    selector: 'etri-dashboard-items',
    styleUrls: ['dashboard-items.component.scss'],
    templateUrl: 'dashboard-items.component.html'
})
export class DashboardItemsComponent {
  readonly name = input.required<string>();
  readonly query = input.required<FindQuery>();
  readonly items = input.required<DashboardItem[]>();
  readonly columns = signal<string[]>([]);
  readonly data = signal<Array<any[]>>([]);
  readonly gridCols = computed(() => {
    if (this.items().length === 1) return 'grid-cols-1';
    else if (this.items().length === 2) return 'grid-cols-1 md:grid-cols-2';
    else if (this.items().length === 3) return 'grid-cols-1 md:grid-cols-3';
    else return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
  });
  readonly loading = signal<boolean>(false);
  readonly onDelete = output();

  private readonly queryService = inject(QueryService);

  runQuery() {
    this.loading.set(true);
    this.queryService.runQuery(this.query().id).pipe(
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: res => {
        const { data, columns } = res;
        this.data.set(data);
        this.columns.set(columns);
      }
    })
  }
}
