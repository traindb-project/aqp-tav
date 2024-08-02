import { Component, computed, input, InputSignal } from '@angular/core';

@Component({
  host: {
    class: 'flex justify-center'
  },
  selector: 'etri-loading',
  standalone: true,
  template: `<span class="loading loading-bars {{sizeClass()}}"></span>`
})
export class LoadingComponent {
  size: InputSignal<'xs' | 'sm' | 'md'> = input<'xs' | 'sm' | 'md'>('md');
  readonly sizeClass = computed(() => {
    switch (this.size()) {
      case 'xs':
        return 'loading-xs';
      case 'sm':
        return 'loading-sm';
      default:
        return 'loading-md';
    }
  });
}
