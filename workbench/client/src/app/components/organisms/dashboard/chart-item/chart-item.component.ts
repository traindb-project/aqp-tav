import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChartItemFields } from '../../../../dto';

@Component({
  imports: [
    FormsModule
  ],
  selector: 'etri-chart-item',
  styleUrls: ['chart-item.component.scss'],
  templateUrl: 'chart-item.component.html'
})
export class ChartItemComponent {
  xAsisLabel = input<string>('Select X-Axis');
  yAsisLabel = input<string>('Select Y-Axis');
  columns = input.required<string[]>();
  fields: ChartItemFields = {
    x_column: null,
    y_column: null,
  };
  onChange = output<ChartItemFields>()

  changeXColumn(x_column: string) {
    this.fields = { ...this.fields, x_column };
    this.onChange.emit(this.fields);
  }

  changeYColumn(y_column: string) {
    this.fields = { ...this.fields, y_column };
    this.onChange.emit(this.fields);
  }
}
