import { Routes } from '@angular/router';
import { SynopsisFormPageComponent, SynopsisListPageComponent } from './pages';

export const synopsisRoutes: Routes = [
  { path: '', component: SynopsisListPageComponent },
  { path: 'register', component: SynopsisFormPageComponent }
];
