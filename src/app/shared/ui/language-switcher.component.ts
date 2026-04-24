import { Component, inject, signal, effect } from "@angular/core";
import { TranslocoModule, TranslocoService } from "@jsverse/transloco";

const STORAGE_KEY = "simplify-agenda-lang";

@Component({
  selector: "app-language-switcher",
  standalone: true,
  imports: [TranslocoModule],
  template: `
    <div class="language-switcher">
      <button
        class="lang-btn"
        [class.active]="currentLang() === 'es'"
        (click)="setLanguage('es')"
      >
        ES
      </button>
      <span class="divider">|</span>
      <button
        class="lang-btn"
        [class.active]="currentLang() === 'ca'"
        (click)="setLanguage('ca')"
      >
        CA
      </button>
      <span class="divider">|</span>
      <button
        class="lang-btn"
        [class.active]="currentLang() === 'de'"
        (click)="setLanguage('de')"
      >
        DE
      </button>
    </div>
  `,
  styles: [
    `
      .language-switcher { display: flex; align-items: center; gap: 0.5rem; }

      .lang-btn {
        background: transparent;
        border: none;
        color: var(--color-text-secondary);
        font-size: 0.875rem;
        font-weight: 500;
        padding: 0.5rem;
        cursor: pointer;
        transition: all 150ms ease;
        border-radius: 0.25rem;
      }
      .lang-btn:hover { color: var(--color-text); }
      .lang-btn.active {
        color: var(--color-primary);
        background: var(--color-primary-light);
      }

      .divider { color: var(--color-border); }
    `,
  ],
})
export class LanguageSwitcherComponent {
  private transloco = inject(TranslocoService);

  currentLang = signal<string>("es");

  constructor() {
    // Load saved preference or detect from browser
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && ["es", "ca", "de"].includes(saved)) {
      this.currentLang.set(saved);
      this.transloco.setActiveLang(saved);
    } else {
      // Try to detect from browser
      const browserLang = this.transloco.getActiveLang();
      if (browserLang === "ca" || browserLang === "de") {
        this.currentLang.set(browserLang);
        this.transloco.setActiveLang(browserLang);
      }
    }
  }

  setLanguage(lang: "es" | "ca" | "de") {
    this.currentLang.set(lang);
    this.transloco.setActiveLang(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  }
}
