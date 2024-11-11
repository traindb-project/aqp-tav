import { Dialog } from '@angular/cdk/dialog';
import { DecimalPipe, LowerCasePipe, UpperCasePipe } from '@angular/common';
import { Component, computed, forwardRef, inject, input, model, Provider, Signal, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ChartItem, ChartType, DashboardItem, RunQuery } from '../../../../dto';
import { ColumnToAxisDataPipe, ColumnToIndexPipe } from '../../../../pipes';
import { PlusIconComponent } from '../../../atoms';
import { BarChartComponent } from '../../charts';
import { LineChartComponent } from '../../charts/line-chart/line-chart.component';
import { MakeChartDialog } from '../../dialogs';

const VALUE_ACCESSOR: Provider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => DashboardItemInputComponent),
  multi: true,
};

@Component({
  imports: [
    PlusIconComponent,
    DecimalPipe,
    BarChartComponent,
    ColumnToIndexPipe,
    ColumnToAxisDataPipe,
    LineChartComponent,
    UpperCasePipe,
  ],
  providers: [VALUE_ACCESSOR],
  selector: 'etri-dashboard-item-input',
  standalone: true,
  styleUrls: ['dashboard-item-input.component.scss'],
  templateUrl: 'dashboard-item-input.component.html'
})
export class DashboardItemInputComponent implements ControlValueAccessor {
  data = input.required<RunQuery>();
  selectedIndex = signal<number>(-1);
  value = model<DashboardItem[]>([]);
  disabled = model<boolean>();
  columns = computed(() => this.data().columns);
  selectedItem: Signal<DashboardItem | null> = computed<DashboardItem | null>(() => {
    const idx = this.selectedIndex();
    if (idx === -1) return null;
    return this.value()[idx];
  });
  chartType: Signal<ChartType | null> = computed(() => {
    const item = this.selectedItem();
    return item?.type ?? null;
  });
  private readonly dialog = inject(Dialog);

  private onChange: any;
  private onTouch: any;

  isNumber(item: any) {
    return !isNaN(+item);
  }

  openMakeViz() {
    const dialog = this.dialog.open<DashboardItem | undefined>(MakeChartDialog, {
      data: this.data(),
    });

    dialog.closed.subscribe(item => {
      if (item) {
        console.log(item);
        this.change([...this.value() as any, item]);
        this.selectedIndex.set(this.selectedIndex() + 1);
      }
    });
  }

  setSelectedIndex(index: number) {
    this.selectedIndex.set(index);
  }

  writeValue(value: ChartItem[]): void {
    this.value.set(value);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  private change(value: DashboardItem[]): void {
    this.value.set([...value]);
    if (this.onChange) this.onChange([...value]);
  }

  protected readonly ChartType = ChartType;
}
