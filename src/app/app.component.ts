import { Component, inject } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { FooterComponent } from "./shared/ui/footer.component";
import { TranslocoService } from "@jsverse/transloco";
import { ThemeService } from "./core/services/theme.service";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet, FooterComponent],
  template: `
    <div class="app-layout">
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

      .app-container {
        flex: 1;
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
export class AppComponent {
  constructor() {
    inject(ThemeService); // Initialize theme service (applies dark class to <html>)

    const transloco = inject(TranslocoService);
    const available = ["es", "ca"];
    const browserLang = (navigator.languages?.[0] ?? navigator.language ?? "es")
      .slice(0, 2)
      .toLowerCase();
    transloco.setActiveLang(available.includes(browserLang) ? browserLang : "es");
  }
}
