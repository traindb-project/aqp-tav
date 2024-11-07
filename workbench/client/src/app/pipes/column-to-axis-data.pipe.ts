import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'columnToAxisData',
  standalone: true,
})
export class ColumnToAxisDataPipe implements PipeTransform {
  transform(column: string | null | undefined, value: Array<any[]>, columns: string[]): any[] {
    if (!column) return value;
    const idx = columns.indexOf(column);
    if (idx === -1) return [];
    return value.map(item => item[idx]);
  }
}
