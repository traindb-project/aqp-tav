import { Directive, input, InputSignal } from '@angular/core';

@Directive()
export class BaseIconDirective {
  type: InputSignal<'solid' | 'outline'> = input<'solid' | 'outline'>('outline');
  class: InputSignal<string> = input<string>('size-6');
}
