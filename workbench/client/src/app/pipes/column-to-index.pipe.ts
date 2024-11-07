import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'columnToIndex',
  standalone: true,
})
export class ColumnToIndexPipe implements PipeTransform {
  transform(column: string | null| undefined, columns: string[]): number {
    if (column === undefined) return -1;
    if (column === null) return -1;
    return columns.indexOf(column);
  }
}
