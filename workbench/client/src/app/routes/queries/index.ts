import { Routes } from '@angular/router';
import { QueryFormPageComponent, QueryListPageComponent } from './pages';

export const queryRoutes: Routes = [
  { path: '', component: QueryListPageComponent },
  { path: 'register', component: QueryFormPageComponent },
  { path: ':id/update', component: QueryFormPageComponent },
];

