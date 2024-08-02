import { Component, input, model, output } from '@angular/core';

@Component({
  selector: 'etri-select-columns',
  standalone: true,
  styleUrls: ['select-columns.component.scss'],
  templateUrl: 'select-columns.component.html',
})
export class SelectColumnsComponent {
  columns = input<string[]>();
  selectedColumns = model<string[]>([]);
  selectColumns = output<string[]>();
}
