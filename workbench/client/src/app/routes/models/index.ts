import { Routes } from '@angular/router';
import { TrainModelPageComponent, ModelListPageComponent, AdditionalTrainModelPageComponent } from './pages';

export const modelRoutes: Routes = [
  { path: '', component: ModelListPageComponent },
  { path: 'train', component: TrainModelPageComponent },
  { path: ':name/additional-train', component: AdditionalTrainModelPageComponent },
];
