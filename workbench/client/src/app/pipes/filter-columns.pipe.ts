import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: 'filterColumns',
  standalone: true,
})
export class FilterColumnsPipe implements PipeTransform {
  transform(columns: string[], selectedColumns?: string[] | null) {
    if (!selectedColumns || selectedColumns.length === 0) return columns;
    return columns.filter(column => selectedColumns.includes(column));
  }
}

