import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal, WritableSignal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LoadingComponent, SearchInputComponent, TrashIconComponent } from '../../../../components';
import { Modeltype } from '../../../../dto';
import { IpAnonymizationPipe, PatternFilterPipe } from '../../../../pipes';
import { ModeltypeService, TraindbService } from '../../../../services';

@Component({
    imports: [
        RouterLink,
        DecimalPipe,
        LoadingComponent,
        PatternFilterPipe,
        SearchInputComponent,
        TrashIconComponent,
        IpAnonymizationPipe
    ],
    selector: 'etri-modeltype-list-page',
    styleUrls: ['modeltype-list-page.component.scss'],
    templateUrl: 'modeltype-list-page.component.html'
})
export class ModeltypeListPageComponent {
  readonly modeltypeList: WritableSignal<Modeltype[]> = signal([]);
  readonly loading = computed(() => this.modeltypeService.loading());
  readonly keyword = signal('');

  private readonly traindbService = inject(TraindbService);
  private readonly modeltypeService = inject(ModeltypeService);

  constructor() {
    this.loadModeltypes();
  }

  isDefaultModeltype(name: string) {
    return ['rspn', 'tablegan', 'ctgan', 'octgan', 'stasy', 'tvae'].includes(name);
  }

  deleteModeltype(event: MouseEvent, name: string) {
    event.stopPropagation();
    const traindbId = this.traindbService.currentId();
    if (!traindbId) return;
    if (!confirm(`${name}을 삭제하시겠습니까?`)) return;
    this.modeltypeService.deleteModeltype(traindbId, name).subscribe({
      next: () => this.loadModeltypes(),
      error: err => {
        console.error(err);
        alert(`Error: ${err.error?.detail ?? err.message}`);
      }
    });
  }

  private loadModeltypes() {
    const traindbId = this.traindbService.currentId();
    this.modeltypeService.searchModeltypes(traindbId!).subscribe({
      next: list => this.modeltypeList.set(list),
      error: console.error,
    });
  }
}
