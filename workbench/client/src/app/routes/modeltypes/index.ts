import { Routes } from '@angular/router';
import { ModeltypeFormPageComponent, ModeltypeListPageComponent } from './pages';

export const modeltypeRoutes: Routes = [
  { path: '', component: ModeltypeListPageComponent },
  { path: 'register', component: ModeltypeFormPageComponent },
];
