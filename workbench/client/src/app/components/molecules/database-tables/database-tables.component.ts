import { Component, input, model, output } from '@angular/core';
import { Table } from '../../../dto';
import { CircleStackIconComponent, TableCellsIconComponent } from '../../atoms';

@Component({
    imports: [
        CircleStackIconComponent,
        TableCellsIconComponent
    ],
    selector: 'etri-database-tables',
    styleUrls: ['database-tables.component.scss'],
    templateUrl: 'database-tables.component.html'
})
export class DatabaseTablesComponent {
  collapse = model(true);
  schema = input.required<string>();
  selected = input<{ schema: string; table: Table; }[]>([]);
  tables = input<Table[]>([]);
  selectTable = output<{ schema: string; table: Table; }>();

  isSelectedSchema(schema: string) {
    return !!this.selected().find(s => s.schema === schema);
  }

  isSelected(schema: string, table: Table) {
    return !!this.selected().find(s => s.schema === schema && s.table.name === table.name);
  }
}

