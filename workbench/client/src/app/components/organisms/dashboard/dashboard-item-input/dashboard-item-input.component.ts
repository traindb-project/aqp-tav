import { Dialog } from '@angular/cdk/dialog';
import { DecimalPipe, UpperCasePipe } from '@angular/common';
import { Component, computed, forwardRef, inject, input, model, Provider, Signal, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ChartItem, ChartType, DashboardItem, MapItem, RunQuery, TableItem } from '../../../../dto';
import { ColumnToAxisDataPipe, FilterColumnsPipe, FilterSelectedRowsPipe } from '../../../../pipes';
import { PlusIconComponent } from '../../../atoms';
import { BarChartComponent, MapChartComponent, PieChartComponent, ScatterChartComponent } from '../../charts';
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
    ColumnToAxisDataPipe,
    LineChartComponent,
    ScatterChartComponent,
    PieChartComponent,
    MapChartComponent,
    UpperCasePipe,
    FilterColumnsPipe,
    FilterSelectedRowsPipe
  ],
  providers: [VALUE_ACCESSOR],
  selector: 'etri-dashboard-item-input',
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
  selectedTableItem = computed<TableItem | null>(() => {
    const item = this.selectedItem();
    return item as TableItem | null;
  });
  selectedChartItem = computed<ChartItem | null>(() => {
    const item = this.selectedItem();
    return item as ChartItem | null;
  });
  selectedMapItem = computed<MapItem | null>(() => {
    const item = this.selectedItem();
    return item as MapItem | null;
  });
  chartType: Signal<ChartType | null> = computed(() => {
    const item = this.selectedItem();
    return item?.type ?? null;
  });
  private readonly dialog = inject(Dialog);

  private onChange: any;
  private onTouch: any;

  deleteItem(index: number) {
    const value = this.value();
    value.splice(index, 1);
    this.change([...value]);
    this.selectedIndex.set(this.selectedIndex() - 1);
  }

  isNumber(item: any) {
    return !isNaN(+item);
  }

  openMakeViz() {
    const dialog = this.dialog.open<DashboardItem | undefined>(MakeChartDialog, {
      data: this.data(),
    });
    dialog.closed.subscribe(item => {
      if (item) {
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
