import { Routes } from '@angular/router';
import { DatabaseFormPageComponent, DatabaseListPageComponent } from './pages';

export const databaseRoutes: Routes = [
  { path: '', component: DatabaseListPageComponent },
  { path: 'register', component: DatabaseFormPageComponent },
  { path: ':id/update', component: DatabaseFormPageComponent },
];
