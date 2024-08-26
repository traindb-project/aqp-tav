import { DialogRef } from '@angular/cdk/dialog';
import { Component, inject, output, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { ModelService, TraindbService } from '../../../../services';
import { DialogHeaderDirective, LoadingComponent } from '../../../atoms';
import { BaseDialogComponent } from '../base-dialog';

@Component({
  selector: 'etri-import-model-dialog_',
  standalone: true,
  styleUrls: ['import-model-dialog.component.scss'],
  templateUrl: 'import-model-dialog.component.html',
  imports: [
    BaseDialogComponent,
    DialogHeaderDirective,
    ReactiveFormsModule,
    FormsModule,
    LoadingComponent
  ]
})
export class ImportModelDialogComponent {
  name: string | null = null;
  file: File | null = null;
  conflictName = false;
  readonly onClose = output<boolean>();
  readonly loading = signal(false);

  private readonly traindbService = inject(TraindbService);
  private readonly modelService = inject(ModelService);

  changeName(name: string) {
    this.name = name;
    if (this.conflictName) this.conflictName = false;
  }

  importModel() {
    const traindbId = this.traindbService.currentId();
    const name = this.name!.trim();
    this.loading.set(true);
    this.modelService.importModel(traindbId!, name, this.file!).pipe(
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: () => this.onClose.emit(true),
      error: err => {
        console.error(err);
        if (err.status === 409) {
          this.conflictName = true;
          alert('이미 사용 중인 모델명입니다.');
          return;
        }
        alert(`Error: ${err.error?.detail ?? err.message}`);
      }
    })
  }

  onFileChange(event: any) {
    this.file = event.target.files[0];
  }
}


@Component({
  imports: [
    ImportModelDialogComponent
  ],
  selector: 'etri-import-model-dialog',
  standalone: true,
  template: `
    <etri-import-model-dialog_
      (onClose)="dialogRef.close($event)"
    />`
})
export class ImportModelDialog {
  readonly dialogRef = inject(DialogRef);
}
