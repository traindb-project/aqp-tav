import { Component, input, output, signal } from '@angular/core';
import { Table } from '../../../dto/table';
import { FormsModule } from '@angular/forms';

interface TrainTableJoinItem {
  table: string | null;
  column: string | null;
  columns: string[];
}

@Component({
    imports: [FormsModule],
    selector: 'etri-train-table-join-inputs',
    styleUrls: ['./train-table-join-inputs.component.scss'],
    templateUrl: 'train-table-join-inputs.component.html'
})
export class TrainTableJoinInputsComponent {

  readonly schemas = input<{ schema: string; table: Table; }[]>([]);
  readonly onChange = output<[string, string][]>();
  readonly value = signal<[TrainTableJoinItem, TrainTableJoinItem][]>([]);

  add() {
    this.value.set([...this.value(), [{ table: null, column: null, columns: [] }, { table: null, column: null, columns: [] }]]);
    this.change();
  }

  changeTable(item: TrainTableJoinItem, table: string | null) {
    const columns = this.schemas().find(s => s.table.name === table)?.table.columns ?? [];
    item.table = table;
    item.columns = columns.map(c => c.name);
    this.change();
  }

  changeColumn(item: TrainTableJoinItem, column: string | null) {
    item.column = column;
    this.change();
  }

  remove(index: number) {
    const value = this.value();
    value.splice(index, 1);
    this.value.set(value);
    this.change();
  }

  private change() {
    const value = this.value();
    this.onChange.emit(value.map(([l, r]) => [`${l.table}.${l.column}`, `${r.table}.${r.column}`]));
  }
}
