import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  { path: '', redirectTo: '/traindb', pathMatch: 'full' },
  { path: 'traindb', loadChildren: () => import('./routes').then(m => m.traindbRoutes) },
  { path: 'dashboard', loadChildren: () => import('./routes').then(m => m.dashboardRoutes) },
  { path: 'benchmarks', loadChildren: () => import('./routes').then(m => m.benchmarkRoutes) },
  { path: 'modeltypes', loadChildren: () => import('./routes').then(m => m.modeltypeRoutes) },
  { path: 'databases', loadChildren: () => import('./routes').then(m => m.databaseRoutes) },
  { path: 'models', loadChildren: () => import('./routes').then(m => m.modelRoutes) },
  { path: 'synopses', loadChildren: () => import('./routes').then(m => m.synopsisRoutes) },
  { path: 'queries', loadChildren: () => import('./routes').then(m => m.queryRoutes) },
];
