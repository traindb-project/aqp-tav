import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal, WritableSignal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LoadingComponent,
  PencilSquareIconComponent,
  SearchInputComponent,
  TrashIconComponent
} from '../../../../components';
import { FindDatabase } from '../../../../dto';
import { IpAnonymizationPipe, PatternFilterPipe } from '../../../../pipes';
import { DatabaseService, TraindbService } from '../../../../services';

@Component({
  imports: [
    DecimalPipe,
    LoadingComponent,
    RouterLink,
    IpAnonymizationPipe,
    PatternFilterPipe,
    SearchInputComponent,
    TrashIconComponent,
    PencilSquareIconComponent
  ],
  selector: 'etri-database-list-page',
  standalone: true,
  styleUrls: ['database-list-page.component.scss'],
  templateUrl: 'database-list-page.component.html'
})
export class DatabaseListPageComponent {
  readonly databaseList: WritableSignal<FindDatabase[]> = signal([]);
  readonly loading = computed(() => this.databaseService.loading());
  readonly keyword = signal('');

  private readonly traindbService = inject(TraindbService);
  private readonly databaseService = inject(DatabaseService);

  constructor() {
    this.loadDatabases();
  }

  deleteDatabase(event: MouseEvent, db: FindDatabase) {
    event.stopPropagation();
    if (!confirm(`${db.name}을 삭제하시겠습니까?`)) return;
    this.databaseService.deleteDatabase(db.id).subscribe({
      next: () => this.loadDatabases(),
      error: err => {
        console.error(err);
        alert(`Error: ${err.error?.detail ?? err.message}`);
      }
    })
  }

  private loadDatabases() {
    const traindbId = this.traindbService.currentId();
    this.databaseService.searchDatabases(traindbId!).subscribe({
      next: list => this.databaseList.set(list),
      error: err => {
        console.error(err);
        alert(`Error: ${err.error?.detail ?? err.message}`);
      },
    });
  }
}
