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
   * Load the Turnstile script and wait for it to be ready
   */
  loadScript(): Promise<void> {
    if (this.loaded() && window.turnstile) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      // Check if already in DOM
      if (document.querySelector('script[src*="cloudflare.com/turnstile"]')) {
        // Script exists, wait for it to be ready
        this.waitForReady().then(resolve).catch(reject);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      script.async = true;
      script.defer = true;

      script.onload = () => {
        // Wait for turnstile.ready() to confirm it's usable
        this.waitForReady().then(resolve).catch(reject);
      };

      script.onerror = () => {
        reject(new Error("Failed to load Turnstile script"));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Wait for window.turnstile to be fully ready
   */
  private waitForReady(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!window.turnstile) {
        reject(new Error("Turnstile not available"));
        return;
      }

      // Use turnstile.ready() callback if available
      if (typeof window.turnstile.ready === "function") {
        window.turnstile.ready(() => {
          this.loaded.set(true);
          resolve();
        });
      } else {
        // Fallback: wait a bit for it to initialize
        let attempts = 0;
        const check = setInterval(() => {
          attempts++;
          if (window.turnstile && typeof window.turnstile.render === "function") {
            clearInterval(check);
            clearTimeout(timeout);
            this.loaded.set(true);
            resolve();
          } else if (attempts > 50) {
            // 5 second timeout
            clearInterval(check);
            clearTimeout(timeout);
            reject(new Error("Turnstile ready timeout"));
          }
        }, 100);

        const timeout = setTimeout(() => {
          clearInterval(check);
          reject(new Error("Turnstile ready timeout"));
        }, 5000);
      }
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
          console.error("Turnstile error callback");
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
