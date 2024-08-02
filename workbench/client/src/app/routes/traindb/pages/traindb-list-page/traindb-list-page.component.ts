import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal, WritableSignal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  LoadingComponent,
  PencilSquareIconComponent,
  SearchInputComponent,
  TrashIconComponent
} from '../../../../components';
import { StorageKey } from '../../../../constants';
import { FindTrainDBDto } from '../../../../dto';
import { IpAnonymizationPipe, PatternFilterPipe } from '../../../../pipes';
import { TraindbService } from '../../../../services';

@Component({
  imports: [
    LoadingComponent,
    DecimalPipe,
    RouterLink,
    IpAnonymizationPipe,
    PatternFilterPipe,
    SearchInputComponent,
    TrashIconComponent,
    PencilSquareIconComponent
  ],
  selector: 'etri-traindb-list-page',
  standalone: true,
  styleUrls: ['traindb-list-page.component.scss'],
  templateUrl: 'traindb-list-page.component.html'
})
export class TraindbListPageComponent {
  readonly traindbList: WritableSignal<FindTrainDBDto[]> = signal([]);
  readonly loading = computed(() => this.traindbService.loading());
  readonly keyword = signal('');

  private readonly router = inject(Router);
  private readonly traindbService = inject(TraindbService);

  constructor() {
    this.loadTraindbs();
  }

  async updateTrainDB(event: MouseEvent, id: number) {
    event.stopPropagation();
    await this.router.navigate(['/traindb', id, 'update']);
  }

  deleteTrainDB(event: MouseEvent, db: FindTrainDBDto) {
    event.stopPropagation();
    if (!confirm(`${db.name}을 삭제하시겠습니까?`)) return;
    this.traindbService.deleteTrainDB(db.id).subscribe({
      next: () => this.loadTraindbs(),
      error: err => {
        console.error(err);
        alert(`Error: ${err.error?.detail ?? err.message}`);
      },
    })
  }

  async moveDashboard(event: MouseEvent, id: number) {
    event.stopPropagation();
    sessionStorage.setItem(StorageKey.CURRENT_TRAINDB, `${id}`);
    await this.router.navigate(['/dashboard']);
  }

  private loadTraindbs() {
    this.traindbService.searchTrainDB().subscribe({
      next: list => this.traindbList.set(list),
      error: console.error,
    });
  }
}
