import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { appRoutes } from './app.routes';
import { monacoConfig } from './config';


export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes, withViewTransitions()),
    provideHttpClient(),
    importProvidersFrom(
      MonacoEditorModule.forRoot(monacoConfig)
    )
  ]
};
