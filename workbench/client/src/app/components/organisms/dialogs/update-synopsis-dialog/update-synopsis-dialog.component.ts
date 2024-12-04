import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { Synopsis, UpdateSynopsis } from '../../../../dto';
import { SynopsisService, TraindbService } from '../../../../services';
import { DialogHeaderDirective, LoadingComponent } from '../../../atoms';
import { BaseDialogComponent } from '../base-dialog';

@Component({
    imports: [
        BaseDialogComponent,
        DialogHeaderDirective,
        FormsModule,
        LoadingComponent
    ],
    selector: 'etri-update-synopsis-dialog_',
    styleUrls: ['update-synopsis-dialog.component.scss'],
    templateUrl: 'update-synopsis-dialog.component.html'
})
export class UpdateSynopsisDialogComponent implements OnInit {
  name: string | null = null;
  status: string | null = null;

  readonly onClose = output<boolean>();
  readonly loading = signal(false);
  readonly synopsis = input.required<Synopsis>();
  readonly conflictName = signal(false);
  private readonly traindbService = inject(TraindbService);
  private readonly synopsysService = inject(SynopsisService);

  updateSynopsis() {
    const traindbId = this.traindbService.currentId();
    const dto: UpdateSynopsis = {
      name: this.synopsis().name === this.name ? null : this.name,
      status: this.synopsis().status === this.status ? null : this.status,
    };
    this.loading.set(true);
    this.synopsysService.updateSynopsis(traindbId!, this.synopsis().name, dto).pipe(
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: () => this.onClose.emit(true),
      error: err => {
        console.error(err);
        if (err.status === 409) {
          this.conflictName.set(true);
          alert('이미 사용 중인 시놉시스명입니다.');
          return;
        }
        alert(`Error: ${err.error?.detail ?? err.message}`);
      }
    });
  }

  changeName(name: string) {
    this.name = name;
    if (this.conflictName()) this.conflictName.set(false);
  }

  ngOnInit() {
    this.name = this.synopsis().name;
    this.status = this.synopsis().status;
  }
}

@Component({
    imports: [
        UpdateSynopsisDialogComponent
    ],
    selector: 'etri-update-synopsis-dialog',
    template: `
    <etri-update-synopsis-dialog_
      [synopsis]="data"
      (onClose)="dialogRef.close($event)"
    />
  `
})
export class UpdateSynopsisDialog {
  readonly dialogRef = inject(DialogRef);
  readonly data: Synopsis = inject(DIALOG_DATA);
}
