import { filter } from 'rxjs';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { UpperCasePipe } from '@angular/common';
import { Component, computed, effect, inject, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CHART_TYPES, ChartType, DashboardItem, RunQuery } from '../../../../dto';
import { ChartItemComponent } from '../../dashboard';
import { BaseDialogComponent } from '../base-dialog';

@Component({
  imports: [
    FormsModule,
    UpperCasePipe,
    BaseDialogComponent,
    ChartItemComponent
  ],
  selector: 'etri-make-chart-dialog_',
  styleUrls: ['make-chart-dialog.component.scss'],
  templateUrl: 'make-chart-dialog.component.html'
})
export class MakeChartDialogComponent {
  fields: any = {};
  readonly data = model.required<RunQuery>();
  readonly chartType = model<ChartType>(ChartType.TABLE);
  readonly title = model<string>('');
  readonly columns = computed(() => this.data().columns);
  readonly onClose = output<DashboardItem | undefined>();
  readonly ChartType = ChartType;
  readonly CHART_TYPES = CHART_TYPES;
  readonly isTable = computed(() => this.chartType() === ChartType.TABLE);
  readonly isChart = computed(() => [ChartType.BAR, ChartType.LINE, ChartType.SCATTER, ChartType.PIE].includes(this.chartType()));
  readonly isMap = computed(() => this.chartType() === ChartType.MAP);

  constructor() {
    effect(() => {
      const chartType = this.chartType();
      this.fields = {};
      if (chartType === ChartType.TABLE) this.fields = { ...this.fields, columns: this.data().columns };
      console.log(this.fields);
    });
  }

  changeChartType(chart_type: ChartType) {
    this.chartType.set(chart_type);
  }

  changeColumns(column: string, checked: boolean) {
    let columns: string[] = [...(this.fields.columns ?? [])];
    if (checked) columns.push(column);
    else columns = columns.filter((c: string) => c !== column);
    this.fields = { ...this.fields, columns };
    console.log(this.fields);
  }

  changeFields(fields: any) {
    this.fields = fields;
  }

  changeGeoColumn(geo_column: string) {
    this.fields = { ...this.fields, geo_column };
  }

  changeMinY(min_y: number) {
    this.fields = { ...this.fields, min_y };
  }

  changeMaxY(max_y: number) {
    this.fields = { ...this.fields, max_y };
  }

  emitDashboardItem() {
    this.onClose.emit({
      title: this.title(),
      type: this.chartType(),
      ...this.fields,
    })
  }
}

@Component({
  imports: [
    MakeChartDialogComponent
  ],
  selector: 'etri-make-chart-dialog',
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
