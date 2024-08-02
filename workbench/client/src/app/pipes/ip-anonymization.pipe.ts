import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ipAnonymization',
  standalone: true
})
export class IpAnonymizationPipe implements PipeTransform {
  transform(value: string | null): string {
    if (!value) return '';
    if (/^(https?:\/\/)?\d+\.\d+\.\d+\.\d+.*$/.test(value)) {
      const chunk = value.split('.')
      return [chunk[0], '***', '***', chunk[3]].join('.');
    }
    return value;
  }
}
