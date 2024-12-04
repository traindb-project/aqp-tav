import { DialogRef } from '@angular/cdk/dialog';
import { Component, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { SynopsisService, TraindbService } from '../../../../services';
import { DialogHeaderDirective, LoadingComponent } from '../../../atoms';
import { BaseDialogComponent } from '../base-dialog';

@Component({
    selector: 'etri-import-synopsis-dialog_',
    styleUrls: ['import-synopsis-dialog.component.scss'],
    templateUrl: 'import-synopsis-dialog.component.html',
    imports: [
        BaseDialogComponent,
        DialogHeaderDirective,
        FormsModule,
        LoadingComponent
    ]
})
export class ImportSynopsisDialogComponent {
  name: string | null = null;
  file: File | null = null;
  conflictName = false;
  readonly onClose = output<boolean>();
  readonly loading = signal(false);

  private readonly traindbService = inject(TraindbService);
  private readonly synopsisService = inject(SynopsisService);

  changeName(name: string) {
    this.name = name;
    if (this.conflictName) this.conflictName = false;
  }

  importSynopsis() {
    const traindbId = this.traindbService.currentId();
    const name = this.name!.trim();
    this.loading.set(true);
    this.synopsisService.importSynopsis(traindbId!, name, this.file!).pipe(
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: () => this.onClose.emit(true),
      error: err => {
        console.error(err);
        if (err.status === 409) {
          this.conflictName = true;
          alert('이미 사용 중인 시놉시스명입니다.');
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
        ImportSynopsisDialogComponent
    ],
    selector: 'etri-import-synopsis-dialog',
    template: `
    <etri-import-synopsis-dialog_
      (onClose)="dialogRef.close($event)"
    />
  `
})
export class ImportSynopsisDialog {
  readonly dialogRef = inject(DialogRef);
}
