import { ApplicationConfig, provideZoneChangeDetection } from "@angular/core";
import { provideRouter } from "@angular/router";
import { provideHttpClient, withFetch } from "@angular/common/http";
import { provideAnimations } from "@angular/platform-browser/animations";
import { provideTransloco } from "@jsverse/transloco";

import { routes } from "./app.routes";

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withFetch()),
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
    }),
  ],
};
