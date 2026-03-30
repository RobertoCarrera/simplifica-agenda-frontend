import { ApplicationConfig, provideZoneChangeDetection } from "@angular/core";
import { provideRouter } from "@angular/router";
import { provideHttpClient, withFetch } from "@angular/common/http";
import { provideAnimations } from "@angular/platform-browser/animations";
import { provideTransloco } from "@jsverse/transloco";
import { TranslocoHttpLoader } from "@jsverse/transloco";

import { routes } from "./app.routes";
import { translocoConfig } from "./transloco.config";

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withFetch()),
    provideAnimations(),
    provideTransloco({
      config: translocoConfig,
      loader: TranslocoHttpLoader,
    }),
  ],
};
