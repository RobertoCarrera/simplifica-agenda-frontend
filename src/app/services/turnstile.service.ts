import { Injectable, signal } from "@angular/core";
import { environment } from "../../environments/environment";

declare global {
  interface Window {
    turnstile: {
      render: (
        element: string | HTMLElement,
        options: TurnstileOptions,
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId: string) => void;
      ready?: (callback: () => void) => void;
    };
  }
}

interface TurnstileOptions {
  sitekey: string;
  callback?: (token: string) => void;
  "error-callback"?: () => void;
  "expired-callback"?: () => void;
}

@Injectable({ providedIn: "root" })
export class TurnstileService {
  private widgetId: string | null = null;

  /**
   * Load the Turnstile script synchronously to ensure turnstile.ready() works
   */
  loadScript(): Promise<void> {
    // Script already loaded and no async/defer means we're good
    const existingScript = document.querySelector('script[src*="cloudflare.com/turnstile"]');
    const isSyncLoaded = existingScript && 
      !(existingScript as HTMLScriptElement).async && 
      !(existingScript as HTMLScriptElement).defer &&
      !existingScript.getAttribute('async');

    if (isSyncLoaded && window.turnstile) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      // Remove any existing script (cached or not)
      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      // NO async/defer - critical for turnstile.ready()

      script.onload = () => {
        // Small delay to let turnstile initialize
        setTimeout(() => {
          resolve();
        }, 100);
      };

      script.onerror = () => {
        reject(new Error("Failed to load Turnstile script"));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Render Turnstile widget and get token
   */
  render(elementId: string | HTMLElement): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!window.turnstile) {
        reject(new Error("Turnstile not loaded"));
        return;
      }

      this.widgetId = window.turnstile.render(elementId, {
        sitekey: environment.turnstileSiteKey,
        callback: (token: string) => {
          resolve(token);
        },
        "error-callback": () => {
          reject(new Error("Turnstile verification failed"));
        },
        "expired-callback": () => {
          reject(new Error("Turnstile token expired"));
        },
      });
    });
  }

  /**
   * Reset the Turnstile widget
   */
  reset(): void {
    if (this.widgetId && window.turnstile) {
      window.turnstile.reset(this.widgetId);
    }
  }

  /**
   * Remove the Turnstile widget
   */
  remove(): void {
    if (this.widgetId && window.turnstile) {
      window.turnstile.remove(this.widgetId);
      this.widgetId = null;
    }
  }
}
