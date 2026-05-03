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
      ready: (callback: () => void) => void;
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
  private loaded = signal(false);
  private widgetId: string | null = null;

  /**
   * Load the Turnstile script synchronously (required for turnstile.ready())
   */
  loadScript(): Promise<void> {
    if (this.loaded() && window.turnstile) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      // Remove existing script if any (to reload fresh)
      const existingScript = document.querySelector('script[src*="cloudflare.com/turnstile"]');
      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?v=" + Date.now();
      // NO async/defer - required for turnstile.ready() to work

      script.onload = () => {
        // Wait for turnstile to be fully ready
        if (window.turnstile?.ready) {
          window.turnstile.ready(() => {
            this.loaded.set(true);
            resolve();
          });
        } else {
          // Fallback: just mark as loaded if ready() not available
          this.loaded.set(true);
          resolve();
        }
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
  render(elementId: string): Promise<string> {
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
