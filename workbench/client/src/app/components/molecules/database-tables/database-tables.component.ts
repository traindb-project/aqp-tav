import { Component, input, model, output } from '@angular/core';
import { Table } from '../../../dto';
import { CircleStackIconComponent, TableCellsIconComponent } from '../../atoms';

@Component({
  imports: [
    CircleStackIconComponent,
    TableCellsIconComponent
  ],
  selector: 'etri-database-tables',
  standalone: true,
  styleUrls: ['database-tables.component.scss'],
  templateUrl: 'database-tables.component.html'
})
export class DatabaseTablesComponent {
  collapse = model(true);
  schema = input.required<string>();
  selected = input<{ schema: string; table: Table; } | null>(null);
  tables = input<Table[]>([]);
  selectTable = output<{ schema: string; table: Table; }>();
}

