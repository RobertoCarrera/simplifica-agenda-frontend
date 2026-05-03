import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";

declare global {
  interface Window {
    turnstile: {
      render(
        container: string | HTMLElement,
        options: TurnstileOptions,
      ): string;
      execute(container: string | HTMLElement): Promise<string>;
      reset(widgetId?: string): void;
      remove(widgetId: string): void;
      ready(callback: () => void): void;
      getResponse(widgetId?: string): string;
    };
  }
}

interface TurnstileOptions {
  sitekey: string;
  callback?: (token: string) => void;
  "error-callback"?: (errorCode: string) => void;
  "expired-callback"?: () => void;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "compact" | "flexible";
  appearance?: "always" | "execute" | "interaction-only";
  execution?: "render" | "execute";
  action?: string;
  cData?: string;
}

@Injectable({ providedIn: "root" })
export class TurnstileService {
  private containerId = "cf-turnstile";

  /**
   * Load the Turnstile script in explicit mode
   */
  loadScript(): Promise<void> {
    if (window.turnstile) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      // Use render=explicit so we control when widgets are created
      script.src =
        "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.onload = () => {
        // Wait for turnstile to be fully ready
        if (window.turnstile.ready) {
          window.turnstile.ready(() => resolve());
        } else {
          // Fallback: poll until ready
          const check = setInterval(() => {
            if (window.turnstile) {
              clearInterval(check);
              resolve();
            }
          }, 50);
          setTimeout(() => {
            clearInterval(check);
            reject(new Error("Turnstile ready timeout"));
          }, 5000);
        }
      };
      script.onerror = () =>
        reject(new Error("Failed to load Turnstile script"));
      document.head.appendChild(script);
    });
  }

  /**
   * Render the widget and get a token.
   * For invisible mode: uses execution:"execute" so challenge doesn't start automatically,
   * then triggers execute() to run it on demand.
   */
  renderAndExecute(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!window.turnstile) {
        reject(new Error("Turnstile not loaded"));
        return;
      }

      const container = document.getElementById(this.containerId);
      if (!container) {
        reject(new Error(`Container "${this.containerId}" not found`));
        return;
      }

      // Clear container and render with execution:"execute"
      container.innerHTML = "";

      const widgetId = window.turnstile.render(container, {
        sitekey: environment.turnstileSiteKey,
        execution: "execute",
        callback: (token: string) => {
          resolve(token);
        },
        "error-callback": (errorCode: string) => {
          reject(new Error(`Turnstile error: ${errorCode}`));
        },
        "expired-callback": () => {
          reject(new Error("Turnstile token expired"));
        },
      });

      // Trigger the challenge after a brief delay to let the widget initialize
      setTimeout(() => {
        window.turnstile.execute(container);
      }, 150);
    });
  }

  /**
   * Reset the widget
   */
  reset(): void {
    if (window.turnstile) {
      window.turnstile.reset();
    }
  }
}