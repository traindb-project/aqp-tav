import { NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavigatorComponent, TraindbBannerComponent } from './components';
import { LayoutService, TraindbService } from './services';


@Component({
    imports: [
        RouterOutlet,
        NavigatorComponent,
        NgClass,
        TraindbBannerComponent,
    ],
    selector: 'etri-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
  readonly layoutService = inject(LayoutService);
  readonly traindbService = inject(TraindbService);
}
