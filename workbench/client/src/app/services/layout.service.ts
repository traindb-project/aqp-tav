import { computed, Injectable, signal, WritableSignal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LayoutService {
  readonly navigation = computed(() => this.showNavigator());
  private readonly showNavigator: WritableSignal<boolean> = signal(false);
  private readonly router = new Router();

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
    ).subscribe({
      next: event => {
        if (event instanceof NavigationEnd) this.setNavigator(event.url);
      }
    });
  }

  private setNavigator(url: string) {
    const hiddenPattern = [
      /(^(\/$|\/traindb$|^\/traindb\/).*)/
    ];
    const hidden = hiddenPattern.some(pattern => pattern.test(url));
    this.showNavigator.set(!hidden);
  }
}
