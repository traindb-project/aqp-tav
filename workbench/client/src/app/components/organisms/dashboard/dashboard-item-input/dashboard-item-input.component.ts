import { Dialog } from '@angular/cdk/dialog';
import { DecimalPipe } from '@angular/common';
import { Component, forwardRef, inject, input, model, Provider, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DashboardItem, RunQuery } from '../../../../dto';
import { PlusIconComponent } from '../../../atoms';
import { MakeChartDialog } from '../../dialogs';

const VALUE_ACCESSOR: Provider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => DashboardItemInputComponent),
  multi: true,
};

@Component({
  providers: [VALUE_ACCESSOR],
  selector: 'etri-dashboard-item-input',
  standalone: true,
  styleUrls: ['dashboard-item-input.component.scss'],
  templateUrl: 'dashboard-item-input.component.html',
  imports: [
    PlusIconComponent,
    DecimalPipe
  ]
})
export class DashboardItemInputComponent implements ControlValueAccessor {
  data = input.required<RunQuery>();
  selectedIndex = signal<number>(-1);
  value = model<DashboardItem[]>([]);
  disabled = model<boolean>();
  private readonly dialog = inject(Dialog);

  private onChange: any;
  private onTouch: any;

  isNumber(item: any) {
    return !isNaN(+item);
  }

  openMakeViz() {
    const dialog = this.dialog.open<DashboardItem | undefined>(MakeChartDialog, {
      data: this.data(),
      width: '90vw'
    });

    dialog.closed.subscribe(item => {
      if (item) this.value.update(v => [...v, item]);
    });
  }

  writeValue(value: DashboardItem[]): void {
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
}
