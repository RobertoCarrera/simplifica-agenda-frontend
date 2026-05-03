import { Injectable, signal } from "@angular/core";
import { environment } from "../../environments/environment";

declare global {
  interface Window {
    turnstile: {
      render: (
        element: string | HTMLElement,
        options: TurnstileOptions,
      ) => string;
      execute: (
        container: string | HTMLElement,
        options?: TurnstileOptions,
      ) => Promise<string>;
      reset: (widgetId?: string) => void;
      remove: (widgetId: string) => void;
      ready?: (callback: () => void) => void;
    };
  }
}

interface TurnstileOptions {
  sitekey?: string;
  callback?: (token: string) => void;
  "error-callback"?: () => void;
  "expired-callback"?: () => void;
  execution?: "render" | "execute";
}

@Injectable({ providedIn: "root" })
export class TurnstileService {
  private widgetId: string | null = null;

  /**
   * Load the Turnstile script synchronously
   */
  loadScript(): Promise<void> {
    // Check if already loaded
    if (window.turnstile) {
      return Promise.resolve();
    }

    // Check if script tag already exists (remove if async/defer)
    const existingScript = document.querySelector('script[src*="cloudflare.com/turnstile"]');
    if (existingScript) {
      const isSyncLoaded = !(existingScript as HTMLScriptElement).async &&
        !(existingScript as HTMLScriptElement).defer &&
        !existingScript.getAttribute('async');

      if (isSyncLoaded) {
        // Already loaded sync, just wait for it to be ready
        return new Promise((resolve) => {
          const check = setInterval(() => {
            if (window.turnstile) {
              clearInterval(check);
              resolve();
            }
          }, 100);
          setTimeout(() => { clearInterval(check); resolve(); }, 3000);
        });
      }
      existingScript.remove();
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      // NO async/defer for invisible mode compatibility

      script.onload = () => {
        // Wait for turnstile to initialize
        const check = setInterval(() => {
          if (window.turnstile) {
            clearInterval(check);
            clearTimeout(timeout);
            resolve();
          }
        }, 100);

        const timeout = setTimeout(() => {
          clearInterval(check);
          reject(new Error("Turnstile load timeout"));
        }, 5000);
      };

      script.onerror = () => {
        reject(new Error("Failed to load Turnstile script"));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Execute Turnstile (for invisible mode)
   * Returns the token directly
   */
  execute(containerId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!window.turnstile) {
        reject(new Error("Turnstile not loaded"));
        return;
      }

      const container = document.getElementById(containerId);
      if (!container) {
        reject(new Error(`Container "${containerId}" not found`));
        return;
      }

      // Render with execution:"execute" - widget is created but challenge doesn't run yet
      this.widgetId = window.turnstile.render(container, {
        sitekey: environment.turnstileSiteKey,
        execution: "execute",
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

      // Trigger the challenge after a short delay to let widget initialize
      setTimeout(() => {
        if (this.widgetId) {
          // execute() takes container (widget ID as string) and optional options
          window.turnstile.execute(this.widgetId, {});
        }
      }, 100);
    });
  }

  /**
   * Trigger the challenge for a previously rendered widget
   */
  triggerExecute(widgetId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!window.turnstile) {
        reject(new Error("Turnstile not loaded"));
        return;
      }

      window.turnstile.execute(widgetId, {
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
   * Render Turnstile widget (for visible mode)
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
