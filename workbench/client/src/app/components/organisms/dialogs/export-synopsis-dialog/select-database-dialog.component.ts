import { DialogRef } from '@angular/cdk/dialog';
import { Component, inject, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FindDatabase } from '../../../../dto';
import { IpAnonymizationPipe } from '../../../../pipes';
import { DatabaseService, TraindbService } from '../../../../services';
import { DialogHeaderDirective } from '../../../atoms';
import { BaseDialogComponent } from '../base-dialog';

@Component({
  imports: [
    BaseDialogComponent,
    DialogHeaderDirective,
    FormsModule,
    IpAnonymizationPipe,
  ],
  selector: 'etri-select-database-dialog_',
  standalone: true,
  styleUrls: ['select-database-dialog.component.scss'],
  templateUrl: 'select-database-dialog.component.html'
})
export class SelectDatabaseDialogComponent {
  readonly databases = signal<FindDatabase[]>([]);
  readonly selected = model<FindDatabase | null>(null);
  readonly onClose = output<FindDatabase | null | undefined>();
  private readonly traindbService = inject(TraindbService);
  private readonly databaseService = inject(DatabaseService);

  constructor() {
    this.loadDatabases();
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
  standalone: true,
  imports: [SelectDatabaseDialogComponent],
  selector: 'etri-select-database-dialog',
  template: `<etri-select-database-dialog_ (onClose)="dialogRef.close($event)" />`
})
export class SelectDatabaseDialog {
  readonly dialogRef = inject(DialogRef);
}
