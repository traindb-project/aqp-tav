import { Routes } from '@angular/router';
import { TraindbFormPageComponent, TraindbListPageComponent } from './pages';

export const traindbRoutes: Routes = [
  { path: '', component: TraindbListPageComponent },
  { path: 'register', component: TraindbFormPageComponent },
  { path: ':id/update', component: TraindbFormPageComponent },
];
