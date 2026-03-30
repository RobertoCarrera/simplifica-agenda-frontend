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
    </div>
  `,
  styles: [
    `
      .language-switcher {
        display: flex;
        align-items: center;
        gap: var(--space-2);
      }

      .lang-btn {
        background: transparent;
        border: none;
        color: var(--color-text-secondary);
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);
        padding: var(--space-1) var(--space-2);
        cursor: pointer;
        transition: all var(--transition-fast);
        border-radius: var(--radius-sm);
      }

      .lang-btn:hover {
        color: var(--color-text-primary);
      }

      .lang-btn.active {
        color: var(--color-primary);
        background: var(--color-primary-light);
      }

      .divider {
        color: var(--color-border);
      }
    `,
  ],
})
export class LanguageSwitcherComponent {
  private transloco = inject(TranslocoService);

  currentLang = signal<string>("es");

  constructor() {
    // Load saved preference or detect from browser
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && ["es", "ca"].includes(saved)) {
      this.currentLang.set(saved);
      this.transloco.setActiveLang(saved);
    } else {
      // Try to detect from browser
      const browserLang = this.transloco.getActiveLang();
      if (browserLang === "ca") {
        this.currentLang.set("ca");
        this.transloco.setActiveLang("ca");
      }
    }
  }

  setLanguage(lang: "es" | "ca") {
    this.currentLang.set(lang);
    this.transloco.setActiveLang(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  }
}
