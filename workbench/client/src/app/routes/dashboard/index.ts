import { Routes } from '@angular/router';
import { DashboardPageComponent, DashboardFormPageComponent } from './pages';

export const dashboardRoutes: Routes = [
  { path: '', component: DashboardPageComponent },
  { path: 'make', component: DashboardFormPageComponent },
  { path: ':id/make', component: DashboardFormPageComponent },
];
