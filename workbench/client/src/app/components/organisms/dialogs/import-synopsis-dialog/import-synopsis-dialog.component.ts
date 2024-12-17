import { DialogRef } from '@angular/cdk/dialog';
import { Component, inject, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { DatabaseService, SynopsisService, TraindbService } from '../../../../services';
import { DialogHeaderDirective, LoadingComponent } from '../../../atoms';
import { BaseDialogComponent } from '../base-dialog';
import { IpAnonymizationPipe } from '../../../../pipes';
import { FindDatabase } from '../../../../dto';

@Component({
  imports: [
    BaseDialogComponent,
    DialogHeaderDirective,
    FormsModule,
    LoadingComponent,
    IpAnonymizationPipe
  ],
  selector: 'etri-import-synopsis-dialog_',
  styleUrls: ['import-synopsis-dialog.component.scss'],
  templateUrl: 'import-synopsis-dialog.component.html',
})
export class ImportSynopsisDialogComponent {
  name: string | null = null;
  file: File | null = null;
  conflictName = false;
  readonly onClose = output<boolean>();
  readonly loading = signal(false);
  readonly databases = signal<FindDatabase[]>([]);
  readonly selectedDatabaseId = model<number | null>(null);

  private readonly traindbService = inject(TraindbService);
  private readonly databaseService = inject(DatabaseService);
  private readonly synopsisService = inject(SynopsisService);

  constructor() {
    this.loadDatabases();
  }

  changeName(name: string) {
    this.name = name;
    if (this.conflictName) this.conflictName = false;
  }

  importSynopsis() {
    const traindbId = this.traindbService.currentId();
    const name = this.name!.trim();
    this.loading.set(true);
    this.synopsisService.importSynopsis(traindbId!, this.selectedDatabaseId(), name, this.file!).pipe(
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

  private loadDatabases() {
    const traindbId = this.traindbService.currentId();
    this.databaseService.searchDatabases(traindbId!).subscribe({
      next: list => this.databases.set(list),
      error: console.error
    });
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
