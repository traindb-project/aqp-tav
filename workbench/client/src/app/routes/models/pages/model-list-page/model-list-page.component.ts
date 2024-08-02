import { Dialog } from '@angular/cdk/dialog';
import { DecimalPipe, JsonPipe } from '@angular/common';
import { Component, computed, inject, signal, WritableSignal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  ArrowUpTrayIconComponent,
  DocumentMagnifyingGlassIconComponent, ImportModelDialog,
  LoadingComponent,
  ModelDialog,
  PencilSquareIconComponent,
  SearchInputComponent,
  TrashIconComponent,
  UpdateModelDialog
} from '../../../../components';
import { Model } from '../../../../dto';
import { IpAnonymizationPipe, PatternFilterPipe } from '../../../../pipes';
import { ModelService, TraindbService } from '../../../../services';

@Component({
  imports: [
    RouterLink,
    DecimalPipe,
    LoadingComponent,
    JsonPipe,
    PatternFilterPipe,
    SearchInputComponent,
    IpAnonymizationPipe,
    TrashIconComponent,
    PencilSquareIconComponent,
    DocumentMagnifyingGlassIconComponent,
    ArrowUpTrayIconComponent,
  ],
  selector: 'etri-model-list-page',
  standalone: true,
  styleUrls: ['model-list-page.component.scss'],
  templateUrl: 'model-list-page.component.html'
})
export class ModelListPageComponent {
  readonly modelList: WritableSignal<Model[]> = signal([]);
  readonly loading = computed(() => this.modelService.loading());
  readonly keyword = signal('');
  private readonly traindbService = inject(TraindbService);
  private readonly modelService = inject(ModelService);
  private readonly dialog = inject(Dialog);

  constructor() {
    this.loadModels();
  }

  updateModel(model: Model) {
    const dialog = this.dialog.open(UpdateModelDialog, {
      data: model
    });
    dialog.closed.subscribe(res => {
      if (res) this.loadModels();
    });
  }

  deleteModel(model: Model) {
    if (!confirm(`${model.name}을 삭제하시겠습니까?`)) return;
    const traindbId = this.traindbService.currentId();
    this.modelService.deleteModel(traindbId!, model.name).subscribe({
      next: () => this.loadModels(),
      error: err => {
        console.error(err);
        alert(`Error: ${err.error?.detail ?? err.message}`);
      }
    })
  }

  showDetail(model: Model) {
    this.dialog.open(ModelDialog, { data: model });
  }

  importModel() {
    const dialog = this.dialog.open(ImportModelDialog);
    dialog.closed.subscribe(res => {
      if (res) this.loadModels();
    });
  }

  private loadModels() {
    const traindbId = this.traindbService.currentId();
    this.modelService.searchModels(traindbId!).subscribe({
      next: list => this.modelList.set(list),
      error: console.error,
    });
  }
}
