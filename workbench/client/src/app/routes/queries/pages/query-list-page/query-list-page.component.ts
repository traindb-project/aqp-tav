import { Dialog } from '@angular/cdk/dialog';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LoadingComponent,
  PencilSquareIconComponent, PlayIconComponent, RunQueryDialog,
  SearchInputComponent,
  TrashIconComponent
} from '../../../../components';
import { FindQuery, QueryType } from '../../../../dto';
import { PatternFilterPipe, QueryTypePipe } from '../../../../pipes';
import { QueryService, TraindbService } from '../../../../services';

@Component({
    imports: [
        RouterLink,
        LoadingComponent,
        PatternFilterPipe,
        SearchInputComponent,
        TrashIconComponent,
        PencilSquareIconComponent,
        PlayIconComponent,
        QueryTypePipe
    ],
    selector: 'etri-query-list-page',
    styleUrls: ['query-list-page.component.scss'],
    templateUrl: 'query-list-page.component.html'
})
export class QueryListPageComponent {
  readonly queryList = signal<FindQuery[]>([]);
  readonly loading = computed(() => this.queryService.loading());
  readonly keyword = signal('');

  private readonly traindbService = inject(TraindbService);
  private readonly queryService = inject(QueryService);
  private readonly dialog = inject(Dialog);
  readonly QueryType = QueryType;

  constructor() {
    this.loadQueries();
  }

  deleteQuery(query: FindQuery) {
    if (!confirm(`${query.name}을 삭제하시겠습니까?`)) return;
    this.queryService.deleteQuery(query.id).subscribe({
      next: () => this.loadQueries(),
      error: err => {
        console.error(err);
        alert(`Error: ${err.error?.detail ?? err.message}`);
      }
    })
  }

  runQuery(query: FindQuery) {
    this.dialog.open(RunQueryDialog, {
      data: query,
      width: '90vw',
    });
  }

  private loadQueries() {
    const traindbId = this.traindbService.currentId();
    this.queryService.searchQueries(traindbId!).subscribe({
      next: list => this.queryList.set(list),
      error: console.error,
    });
  }
}
