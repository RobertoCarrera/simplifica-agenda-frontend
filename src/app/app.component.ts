import { Component, inject, OnInit } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { FooterComponent } from "./shared/ui/footer.component";
import { TranslocoService } from "@jsverse/transloco";
import { BrandingService } from "./services/branding.service";
import { isDevMode } from "@angular/core";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet, FooterComponent],
  template: `
    <div class="app-layout">
      @if (brandingService.branding(); as branding) {
        <div class="branded-header" [style.--brand-primary]="branding.primary_color"
             [style.--brand-secondary]="branding.secondary_color">
          <div class="header-content">
            @if (branding.logo_url) {
              <img [src]="branding.logo_url" [alt]="branding.name" class="header-logo" />
            } @else {
              <div class="header-logo-placeholder">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
              </div>
            }
            <span class="header-company-name">{{ branding.name }}</span>
          </div>
        </div>
      }
      <main class="app-container">
        <router-outlet></router-outlet>
      </main>
      <app-footer />
    </div>
  `,
  styles: [
    `
      .app-layout {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
      }

      .branded-header {
        background: var(--brand-primary, #10B981);
        padding: 0.75rem 1.5rem;
        display: flex;
        align-items: center;
      }

      .header-content {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        width: 100%;
      }

      .header-logo {
        width: 2.25rem;
        height: 2.25rem;
        border-radius: 0.5rem;
        object-fit: contain;
        background: rgba(255,255,255,0.2);
        padding: 0.25rem;
      }

      .header-logo-placeholder {
        width: 2.25rem;
        height: 2.25rem;
        border-radius: 0.5rem;
        background: rgba(255,255,255,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        flex-shrink: 0;
      }

      .header-logo-placeholder svg {
        width: 1.25rem;
        height: 1.25rem;
      }

      .header-company-name {
        font-weight: 600;
        color: white;
        font-size: 1rem;
        flex: 1;
      }

      .app-container {
        flex: 1;
        padding: 0 24px;
        font-family:
          "Inter",
          -apple-system,
          BlinkMacSystemFont,
          "Segoe UI",
          Roboto,
          sans-serif;
      }
    `,
  ],
})
export class AppComponent implements OnInit {
  readonly brandingService = inject(BrandingService);

  ngOnInit() {
    // Dark mode detection
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    document.documentElement.classList.toggle("dark", mq?.matches ?? false);
    mq?.addEventListener("change", (e) => {
      document.documentElement.classList.toggle("dark", e.matches);
    });

    // Language
    const transloco = inject(TranslocoService);
    const available = ["es", "ca"];
    const browserLang = (navigator.languages?.[0] ?? navigator.language ?? "es")
      .slice(0, 2)
      .toLowerCase();
    transloco.setActiveLang(available.includes(browserLang) ? browserLang : "es");

    // Load dynamic branding (skip in dev mode to avoid errors without real BFF)
    if (!isDevMode()) {
      this.brandingService.getBranding().subscribe((branding) => {
        this.brandingService.setBranding(branding);
        document.title = branding.name + " Agenda";
        document.documentElement.style.setProperty("--brand-primary", branding.primary_color);
        document.documentElement.style.setProperty("--brand-secondary", branding.secondary_color);

        // Update theme-color meta tag dynamically
        const metaThemeColor = document.getElementById("theme-color-meta");
        if (metaThemeColor) {
          metaThemeColor.setAttribute("content", branding.primary_color);
        }
      });
    }
  }
}
