import { provideHttpClient, withFetch } from '@angular/common/http';
import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideLocalStorageBroker } from '@tmdjr/ngx-local-storage-client';
import { ThemePickerService } from '@tmdjr/ngx-theme-picker';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withFetch()),
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    ...provideLocalStorageBroker({
      iframeUrl:
        'https://beta.ngx-workshop.io/assets/ngx-broker/ngx-local-storage-broker.html',
      brokerOrigin: 'https://beta.ngx-workshop.io',
      namespace: 'mfe-remotes',
      requestTimeoutMs: 3000,
    }),
    provideAppInitializer(() => {
      inject(ThemePickerService);
    }),
  ],
};
