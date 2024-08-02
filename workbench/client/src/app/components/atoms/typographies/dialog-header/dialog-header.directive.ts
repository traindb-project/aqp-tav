import { Directive } from '@angular/core';

@Directive({
  host: {
    class: 'text-2xl font-bold'
  },
  selector: '[etriDialogHeader]',
  standalone: true
})
export class DialogHeaderDirective {
}
