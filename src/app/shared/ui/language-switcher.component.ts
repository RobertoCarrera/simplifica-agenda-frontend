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
      .language-switcher { @apply flex items-center gap-2; }

      .lang-btn {
        @apply bg-transparent border-none text-secondary text-sm font-medium px-2 py-1 cursor-pointer transition-all duration-150 rounded;
        &:hover { @apply text-slate-800; }
        &.active { @apply text-primary bg-emerald-50; }
      }

      .divider { @apply text-slate-300; }
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
