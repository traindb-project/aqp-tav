import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, inject, input, output } from '@angular/core';
import { DashboardItem, RunQuery } from '../../../../dto';
import { DialogHeaderDirective } from '../../../atoms';
import { BaseDialogComponent } from '../base-dialog';

@Component({
  selector: 'etri-make-chart-dialog_',
  standalone: true,
  styleUrls: ['make-chart-dialog.component.scss'],
  templateUrl: 'make-chart-dialog.component.html',
  imports: [
    BaseDialogComponent,
    DialogHeaderDirective
  ]
})
export class MakeChartDialogComponent {
  readonly data = input.required<RunQuery>();
  readonly onClose = output<DashboardItem | undefined>();
}

@Component({
  selector: 'etri-make-chart-dialog',
  standalone: true,
  imports: [
    MakeChartDialogComponent
  ],
  template: `
    <etri-make-chart-dialog_
      [data]="data"
      (onClose)="dialogRef.close($event)"
    />
  `
})
export class MakeChartDialog {
  readonly dialogRef = inject(DialogRef);
  readonly data: RunQuery = inject(DIALOG_DATA);
}
