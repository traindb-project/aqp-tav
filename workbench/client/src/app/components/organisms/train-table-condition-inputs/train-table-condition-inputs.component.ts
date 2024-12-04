import { Component, effect, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
@Component({
    imports: [FormsModule],
    selector: 'etri-train-table-condition-inputs',
    styleUrls: ['train-table-condition-inputs.component.scss'],
    templateUrl: 'train-table-condition-inputs.component.html'
})
export class TrainTableConditionInputsComponent {
  readonly columns = input<string[]>([]);
  readonly columnValues = input<{ column: string; value: string | null }[]>([]);
  readonly onChange = output<{ column: string; value: string | null }[]>();
  values: { column: string; value: string | null }[] = [];

  constructor() {
    effect(() => {
      this.values = this.columns().map(c => ({ column: c, value: this.columnValues().find(v => v.column === c)?.value ?? null }));
      console.log(this.values);
    });
  }

  changeValue(index: number, value: string | null) {
    this.values[index].value = value;
    this.onChange.emit([...this.values]);
  }
}
