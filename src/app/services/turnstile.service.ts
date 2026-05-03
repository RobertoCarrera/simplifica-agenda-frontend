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
   * Note: Cloudflare script is async, we need to wait for window.turnstile
   */
  loadScript(): Promise<void> {
    if (window.turnstile) {
      this.loaded.set(true);
      return Promise.resolve();
    }

    if (this.loaded()) {
      // Script tag added but window.turnstile not ready yet, poll for it
      return this.waitForTurnstile();
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      script.async = true;
      script.defer = true;

      // Poll until window.turnstile is available
      const pollInterval = setInterval(() => {
        if (window.turnstile) {
          clearInterval(pollInterval);
          clearTimeout(timeout);
          this.loaded.set(true);
          resolve();
        }
      }, 100);

      // Timeout after 10 seconds
      const timeout = setTimeout(() => {
        clearInterval(pollInterval);
        reject(new Error("Turnstile script load timeout"));
      }, 10000);

      script.onerror = () => {
        clearInterval(pollInterval);
        clearTimeout(timeout);
        reject(new Error("Failed to load Turnstile script"));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Wait for window.turnstile to be available (already loaded but object not ready)
   */
  private waitForTurnstile(): Promise<void> {
    return new Promise((resolve, reject) => {
      const pollInterval = setInterval(() => {
        if (window.turnstile) {
          clearInterval(pollInterval);
          clearTimeout(timeout);
          resolve();
        }
      }, 100);

      const timeout = setTimeout(() => {
        clearInterval(pollInterval);
        reject(new Error("Turnstile object not available"));
      }, 5000);

      // Timeout in 5 seconds
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
   * Remove the Turnstile widget
   */
  remove(): void {
    if (this.widgetId && window.turnstile) {
      window.turnstile.remove(this.widgetId);
      this.widgetId = null;
    }
  }
}
