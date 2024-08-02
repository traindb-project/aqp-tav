import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { Model, UpdateModel } from '../../../../dto';
import { ModelService, TraindbService } from '../../../../services';
import { DialogHeaderDirective, LoadingComponent } from '../../../atoms';
import { BaseDialogComponent } from '../base-dialog';

@Component({
  imports: [
    BaseDialogComponent,
    DialogHeaderDirective,
    FormsModule,
    LoadingComponent,
  ],
  selector: 'etri-update-model-dialog_',
  standalone: true,
  styleUrls: ['update-model-dialog.component.scss'],
  templateUrl: 'update-model-dialog.component.html'
})
export class UpdateModelDialogComponent implements OnInit {
  name: string | null = null;
  status: string | null = null;

  readonly onClose = output<boolean>();
  readonly loading = signal(false);
  readonly model = input.required<Model>();
  readonly conflictName = signal(false);
  private readonly traindbService = inject(TraindbService);
  private readonly modelService = inject(ModelService);

  updateModel() {
    const traindbId = this.traindbService.currentId();
    const dto: UpdateModel = {
      name: this.model().name === this.name ? null : this.name,
      status: this.model().status === this.status ? null : this.status,
    };
    this.loading.set(true);
    this.modelService.updateModel(traindbId!, this.model().name, dto).pipe(
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: () => this.onClose.emit(true),
      error: err => {
        console.error(err);
        if (err.status === 409) {
          this.conflictName.set(true);
          alert('이미 사용 중인 모델명입니다.');
          return;
        }
        alert(`Error: ${err.error?.detail ?? err.message}`);
      },
    });
  }

  changeName(name: string) {
    this.name = name;
    if (this.conflictName()) this.conflictName.set(false);
  }

  ngOnInit() {
    this.name = this.model().name;
    this.status = this.model().status;
  }
}

@Component({
  imports: [
    UpdateModelDialogComponent
  ],
  selector: 'etri-update-model-dialog',
  standalone: true,
  template: `
    <etri-update-model-dialog_
      [model]="data"
      (onClose)="dialogRef.close($event)"
    />
  `
})
export class UpdateModelDialog {
  readonly dialogRef = inject(DialogRef);
  readonly data: Model = inject(DIALOG_DATA);
}
