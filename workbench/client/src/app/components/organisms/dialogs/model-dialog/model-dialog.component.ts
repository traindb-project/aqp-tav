import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { DatePipe, DecimalPipe, PercentPipe } from '@angular/common';
import { Component, computed, effect, inject, input, output } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { Model } from '../../../../dto';
import { TraindbService } from '../../../../services';
import { ArrowDownTrayIconComponent, DialogHeaderDirective } from '../../../atoms';
import { BaseDialogComponent } from '../base-dialog';

@Component({
  imports: [
    BaseDialogComponent,
    DialogHeaderDirective,
    PercentPipe,
    DecimalPipe,
    DatePipe,
    ArrowDownTrayIconComponent
  ],
  selector: 'etri-model-dialog_',
  standalone: true,
  styleUrls: ['model-dialog.component.scss'],
  templateUrl: 'model-dialog.component.html'
})
export class ModelDialogComponent {
  downloadLink: string | null = null;
  readonly model = input.required<Model>();
  readonly hyperParameters = computed(() => {
    const options = this.model().options;
    return Object.keys(options).map(key => ({ name: key, value: options[key] }));
  });
  readonly onClose = output();

  private readonly traindbService = inject(TraindbService);

  constructor() {
    effect(() => {
      const model = this.model();
      const traindbId = this.traindbService.currentId();
      if (model) this.downloadLink = environment.apiHost + `/models/${model.name}/export?traindb_id=${traindbId}`;
    });
  }
}


@Component({
  imports: [
    ModelDialogComponent
  ],
  selector: 'etri-model-dialog',
  standalone: true,
  template: `
    <etri-model-dialog_
      [model]="data"
      (onClose)="dialogRef.close()"
    />
  `
})
export class ModelDialog {
  readonly dialogRef = inject(DialogRef);
  readonly data: Model = inject(DIALOG_DATA);
}
