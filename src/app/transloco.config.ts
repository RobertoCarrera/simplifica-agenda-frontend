import { TranslocoConfig } from "@jsverse/transloco";

export const translocoConfig: TranslocoConfig = {
  defaultLang: "es",
  availableLangs: ["es", "ca"],
  reRenderOnLangChange: true,
  prodMode: false,
  failedRetries: 3,
  flatten: { aot: true },
  missingHandler: {
    logMissingKey: true,
    useFallbackTranslation: true,
    allowEmpty: false,
  },
  interpolation: ["{{", "}}"],
  scopes: {},
};
