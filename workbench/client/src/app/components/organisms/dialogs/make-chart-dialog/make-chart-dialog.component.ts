import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { UpperCasePipe } from '@angular/common';
import { Component, computed, inject, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CHART_TYPES, ChartType, DashboardItem, RunQuery } from '../../../../dto';
import { DialogHeaderDirective } from '../../../atoms';
import { ChartItemComponent } from '../../dashboard';
import { BaseDialogComponent } from '../base-dialog';

@Component({
  selector: 'etri-make-chart-dialog_',
  standalone: true,
  styleUrls: ['make-chart-dialog.component.scss'],
  templateUrl: 'make-chart-dialog.component.html',
  imports: [
    BaseDialogComponent,
    DialogHeaderDirective,
    FormsModule,
    UpperCasePipe,
    ChartItemComponent
  ]
})
export class MakeChartDialogComponent {
  fields: any = {};
  readonly data = model.required<RunQuery>();
  readonly chartType = model<ChartType>(ChartType.BAR);
  readonly columns = computed(() => this.data().columns);
  readonly types = computed(() => this.data().types);
  readonly onClose = output<DashboardItem | undefined>();
  readonly ChartType = ChartType;
  readonly CHART_TYPES = CHART_TYPES;
  readonly isChartItem = computed(() => [ChartType.BAR, ChartType.LINE, ChartType.SCATTER, ChartType.PIE].includes(this.chartType()));

  changeFields(fields: any) {
    this.fields = fields;
  }

  emitDashboardItem() {
    this.onClose.emit({
      type: this.chartType(),
      ...this.fields,
    })
  }
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
