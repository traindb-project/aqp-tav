import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DashboardButtonComponent } from '../../../../components';

@Component({
  host: {
    class: 'page',
  },
  selector: 'etri-dashboard-page',
  standalone: true,
  styleUrls: ['dashboard-page.component.scss'],
  templateUrl: 'dashboard-page.component.html',
  imports: [
    DashboardButtonComponent,
    RouterLink
  ]
})
export class DashboardPageComponent {
  createDashboard() {
    alert('Create Dashboard');
  }
}
