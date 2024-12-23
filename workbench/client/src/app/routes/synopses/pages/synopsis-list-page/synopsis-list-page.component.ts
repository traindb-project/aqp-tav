import { Dialog } from '@angular/cdk/dialog';
import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal, WritableSignal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import {
  ArrowDownTrayIconComponent,
  ArrowUpTrayIconComponent, ImportSynopsisDialog,
  LoadingComponent,
  PencilSquareIconComponent,
  SearchInputComponent,
  SelectDatabaseDialog,
  TrashIconComponent, UpdateSynopsisDialog
} from '../../../../components';
import { FindDatabase, Synopsis } from '../../../../dto';
import { PatternFilterPipe } from '../../../../pipes';
import { SynopsisService, TraindbService } from '../../../../services';

@Component({
  imports: [
    RouterLink,
    DecimalPipe,
    LoadingComponent,
    PatternFilterPipe,
    SearchInputComponent,
    TrashIconComponent,
    PencilSquareIconComponent,
    ArrowUpTrayIconComponent,
    ArrowDownTrayIconComponent
  ],
  selector: 'etri-synopsis-list-page',
  styleUrls: ['synopsis-list-page.component.scss'],
  templateUrl: 'synopsis-list-page.component.html'
})
export class SynopsisListPageComponent {
  readonly synopsisList: WritableSignal<Synopsis[]> = signal([]);
  readonly loading = computed(() => this.synopsisService.loading());
  readonly keyword = signal('');
  readonly apiHost = environment.apiHost;
  private readonly traindbService = inject(TraindbService);
  private readonly synopsisService = inject(SynopsisService);
  private readonly dialog = inject(Dialog);
  readonly traindbId = computed(() => this.traindbService.currentId());

  constructor() {
    this.loadSynopses();
  }

  importSynopsis() {
    const dialog = this.dialog.open(ImportSynopsisDialog);
    dialog.closed.subscribe(res => {
      if (res) this.loadSynopses();
    })
  }

  exportSynopsis(synopsis: Synopsis) {
    const dialog = this.dialog.open<FindDatabase | null>(SelectDatabaseDialog);
    dialog.closed.subscribe((database: FindDatabase | null | undefined) => {
      if (database === undefined) return;
      let href = `${this.apiHost}/synopses/${synopsis.name}/export?traindb_id=${this.traindbId()}`;
      if (database) href += `&database_id=${database.id}`;
      const link = document.createElement('a');
      link.href = href;
      link.download = `${synopsis.name}.json`;
      link.click();
    })
  }

  deleteSynopsis(synopsis: Synopsis) {
    if (!confirm(`${synopsis.name}을 삭제하시겠습니까?`)) return;
    const dialog = this.dialog.open<FindDatabase | null>(SelectDatabaseDialog);
    dialog.closed.subscribe((database: FindDatabase | null | undefined) => {
      if (database === undefined) return;
      const traindbId = this.traindbService.currentId();
      this.synopsisService.deleteSynopsis(traindbId!, database?.id ?? null, synopsis.name).subscribe({
        next: () => this.loadSynopses(),
        error: err => {
          console.error(err);
          alert(`Error: ${err.error?.detail ?? err.message}`);
        }
      })
    });
  }

  updateSynopsis(synopsis: Synopsis) {
    const dialog = this.dialog.open(UpdateSynopsisDialog, {
      data: synopsis
    });
    dialog.closed.subscribe(res => {
      if (res) this.loadSynopses();
    });
  }

  private loadSynopses() {
    const traindbId = this.traindbService.currentId();
    this.synopsisService.searchSynopses(traindbId!).subscribe({
      next: list => this.synopsisList.set([...list]),
      error: console.error,
    })
  }
}
