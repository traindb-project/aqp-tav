import { Component, effect, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Column } from '../../../dto';
import { LoadingComponent } from '../../atoms';

@Component({
  selector: 'etri-train-model-data',
  standalone: true,
  styleUrls: ['train-model-data.component.scss'],
  templateUrl: 'train-model-data.component.html',
  imports: [
    LoadingComponent,
    FormsModule
  ]
})
export class TrainModelDataComponent {
  columnsLoading = input(false);
  columns = input<Column[]>([]);
  selectedColumns = model<Column[]>([]);
  onPreview = output<string[]>();

  constructor() {
    effect(() => {
      console.log(this.selectedColumns());
    });
  }


  toggleColumn(event: MouseEvent, column: Column) {
    // event.preventDefault();
    const idx = this.selectedColumns().map(col => col.name).indexOf(column.name);
    const columns = this.selectedColumns();
    if (idx !== -1) columns.splice(idx, 1);
    else columns.push(column);
    this.selectedColumns.set([...columns]);
  }

  isSelected(column: Column) {
    return this.selectedColumns().map(col => col.name).includes(column.name);
  }
}
