import { Injectable, inject } from "@angular/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
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
  private sanitizer = inject(DomSanitizer);
  private containerId = "cf-turnstile";

  /**
   * Load the Turnstile script
   */
  loadScript(): Promise<void> {
    if (window.turnstile) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src =
        "https://challenges.cloudflare.com/turnstile/v0/api.js";

      script.onload = () => resolve();
      script.onerror = () =>
        reject(new Error("Failed to load Turnstile script"));

      document.head.appendChild(script);
    });
  }

  /**
   * Render widget and get token (invisible mode)
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

      // Bypass Angular security to allow Turnstile injection
      const safeHtml = this.sanitizer.bypassSecurityTrustHtml("");
      container.innerHTML = ""; // Clear without security issue

      window.turnstile.render(container, {
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

      // Trigger the challenge to start
      setTimeout(() => {
        window.turnstile.execute(container);
      }, 200);
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