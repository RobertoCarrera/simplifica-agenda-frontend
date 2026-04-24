import { Component, inject, OnInit } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { FooterComponent } from "./shared/ui/footer.component";
import { TranslocoService } from "@jsverse/transloco";

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
  ngOnInit() {
    // Detect and react to browser dark mode preference — applies class to <html>
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
  }
}
