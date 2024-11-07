import { Component } from '@angular/core';
import { PlusIconComponent } from '../../icons';

@Component({
  imports: [
    PlusIconComponent
  ],
  selector: 'etri-dashboard-button',
  standalone: true,
  styleUrl: './dashboard-button.component.scss',
  templateUrl: './dashboard-button.component.html',
})
export class DashboardButtonComponent {
}
