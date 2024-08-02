import { Routes } from '@angular/router';
import { TrainModelPageComponent, ModelListPageComponent } from './pages';

export const modelRoutes: Routes = [
  { path: '', component: ModelListPageComponent },
  { path: 'train', component: TrainModelPageComponent },
];
