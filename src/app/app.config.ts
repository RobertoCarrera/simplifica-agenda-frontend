import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from "@angular/core";
import { provideRouter } from "@angular/router";
import { provideHttpClient, withFetch, withInterceptors } from "@angular/common/http";
import { provideAnimations } from "@angular/platform-browser/animations";
import { bookingAuthInterceptor } from "./interceptors/booking-auth.interceptor";
import { provideTransloco } from "@jsverse/transloco";
import { TranslocoHttpLoader } from "./transloco-http.loader";

import { routes } from "./app.routes";
import { provideServiceWorker } from '@angular/service-worker';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withFetch(), withInterceptors([bookingAuthInterceptor])),
    provideAnimations(),
    provideTransloco({
      config: {
        defaultLang: "es",
        availableLangs: ["es", "ca"],
        reRenderOnLangChange: true,
        prodMode: false,
        missingHandler: {
          logMissingKey: true,
          useFallbackTranslation: true,
        },
      },
      loader: TranslocoHttpLoader,
    }), provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
          }),
  ],
};
