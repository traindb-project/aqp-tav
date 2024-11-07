import { Component, input, output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChartItemFields } from '../../../../dto';

@Component({
  selector: 'etri-chart-item',
  standalone: true,
  styleUrls: ['chart-item.component.scss'],
  templateUrl: 'chart-item.component.html',
  imports: [
    ReactiveFormsModule,
    FormsModule
  ]
})
export class ChartItemComponent {
  columns = input.required<string[]>();
  types = input.required<string[]>();
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
