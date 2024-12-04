import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterSelectedRows',
  standalone: true,
})
export class FilterSelectedRowsPipe implements PipeTransform {
  transform(row: any[], columns: string[], selectedColumns?: string[] | null) {
    if (!selectedColumns || selectedColumns.length === 0) return row;
    const selectedColumnIndexes = selectedColumns.map(column => columns.indexOf(column));
    return row.filter((_, index) => selectedColumnIndexes.includes(index));
  }
}
