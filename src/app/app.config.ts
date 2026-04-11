import { ApplicationConfig, provideZoneChangeDetection } from "@angular/core";
import { provideRouter } from "@angular/router";
import { provideHttpClient, withFetch, withInterceptors } from "@angular/common/http";
import { provideAnimations } from "@angular/platform-browser/animations";
import { bookingAuthInterceptor } from "./interceptors/booking-auth.interceptor";
import { provideTransloco } from "@jsverse/transloco";
import { TranslocoHttpLoader } from "./transloco-http.loader";

import { routes } from "./app.routes";

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withFetch(), withInterceptors([bookingAuthInterceptor])),
    provideAnimations(),
    // TODO: Re-enable PWA service worker after installing @angular/service-worker
    // import { provideServiceWorker } from "@angular/service-worker";
    // provideServiceWorker("ngsw-config.json", { enabled: !isDevMode(), registrationStrategy: "registerWhenStable:complete" }),
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
    }),
  ],
};
