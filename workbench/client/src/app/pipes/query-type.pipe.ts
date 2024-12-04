import { Pipe, PipeTransform } from '@angular/core';
import { QueryType } from '../dto';

@Pipe({
  standalone: true,
  name: 'queryType',
})
export class QueryTypePipe implements PipeTransform {
  transform(value: QueryType): string {
    if (value === QueryType.APPROXIMATE) {
      return '근사질의';
    } else if (value === QueryType.INCREMENTAL) {
      return '점진적질의';
    }
    return '정확질의';
  }
}
