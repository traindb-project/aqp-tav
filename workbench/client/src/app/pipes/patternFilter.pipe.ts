import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'patternFilter',
  standalone: true,
})
export class PatternFilterPipe implements PipeTransform {
  transform(list: any[], pattern: string | null, keys: string | string[] | null = null): any[] {
    if (!pattern) return list;
    const regex = this.toRegEx(pattern);
    return list.filter(item => {
      let value = item;
      if (!keys) return regex.test(value);
      if (!Array.isArray(keys)) keys = [keys];
      for (const key of keys) value = value[key];
      return regex.test(value ?? '');
    });
  }

  private toRegEx(value: string) {
    const s = '.*+?^$[]{}()|\\';
    value = value.split('').map(c => s.includes(c) ? '\\' + c : c).join('');
    return new RegExp(`${value}`, 'i');
  }
}
