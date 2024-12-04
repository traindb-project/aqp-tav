import { Component, effect, inject, input, model, OnInit, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Column, Table } from '../../../dto';
import { LoadingComponent } from '../../atoms';
import { TableService } from '../../../services';
import { finalize } from 'rxjs';

@Component({
    selector: 'etri-train-model-data',
    styleUrls: ['train-model-data.component.scss'],
    templateUrl: 'train-model-data.component.html',
    imports: [
        LoadingComponent,
        FormsModule
    ]
})
export class TrainModelDataComponent implements OnInit {
  readonly databaseId = input.required<number>();
  readonly schema = model.required<{ schema: string; table: Table }>();
  readonly columnsLoading = signal(false);
  readonly onPreview = output<{ schema: string; table: Table }>();
  selectedColumns = signal<Column[]>([]);

  readonly onSelectColumns = output<Column[]>();

  readonly tableService = inject(TableService);

  constructor() {
    effect(() => {
      const selectedColumns = this.selectedColumns();
      this.onSelectColumns.emit(selectedColumns);
    });
  }

  preview() {
    console.log(this.schema());
    this.onPreview.emit(this.schema());
  }

  ngOnInit() {
    this.columnsLoading.set(true);
    this.tableService.describeTable(this.databaseId(), this.schema().schema, this.schema().table.name)
      .pipe(finalize(() => this.columnsLoading.set(false)))
      .subscribe({
        next: columns => {
          this.schema().table.columns = columns;
        },
        error: console.error
      });
  }


  toggleColumn(event: MouseEvent, column: Column) {
    event.preventDefault();
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
