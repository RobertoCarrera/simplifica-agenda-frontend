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
   * Load the Turnstile script if not already loaded
   */
  loadScript(): Promise<void> {
    if (this.loaded()) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      script.async = true;
      script.defer = true;

      script.onload = () => {
        this.loaded.set(true);
        resolve();
      };

      script.onerror = () => {
        reject(new Error("Failed to load Turnstile script"));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Render Turnstile widget and get token
   * Returns a promise that resolves with the token
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
          reject(new Error("Turnstile error"));
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
   * Remove the Turnstile widget and clear internal state
   */
  remove(): void {
    if (this.widgetId && window.turnstile) {
      window.turnstile.remove(this.widgetId);
    }
    this.widgetId = null;
  }
}
