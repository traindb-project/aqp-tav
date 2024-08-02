import { NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent, NavigatorComponent, TraindbBannerComponent } from './components';
import { LayoutService, TraindbService } from './services';

@Component({
  imports: [
    RouterOutlet,
    HeaderComponent,
    NavigatorComponent,
    NgClass,
    TraindbBannerComponent,
  ],
  selector: 'etri-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  readonly layoutService = inject(LayoutService);
  readonly traindbService = inject(TraindbService);
}
