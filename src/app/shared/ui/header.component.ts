import { Component, Input, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { TranslocoModule } from "@jsverse/transloco";
import { LanguageSwitcherComponent } from "./language-switcher.component";

@Component({
  selector: "app-header",
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    TranslocoModule,
    LanguageSwitcherComponent,
  ],
  template: `
    <header class="site-header">
      <div class="header-container">
        <a routerLink="/" class="logo">
          <img
            *ngIf="logoUrl"
            [src]="logoUrl"
            [alt]="companyName"
            class="logo-img"
          />
          <span *ngIf="!logoUrl" class="logo-text">{{ companyName }}</span>
        </a>

        <nav class="main-nav">
          <a
            routerLink="/"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: true }"
          >
            {{ "nav.home" | transloco }}
          </a>
          <a routerLink="/servicios" routerLinkActive="active">
            {{ "nav.services" | transloco }}
          </a>
          <a routerLink="/profesionales" routerLinkActive="active">
            {{ "nav.professionals" | transloco }}
          </a>
        </nav>

        <div class="header-actions">
          <app-language-switcher />
        </div>
      </div>
    </header>
  `,
  styles: [`
    :host { display: block; }

    .site-header {
      @apply bg-slate-50 border-b border-slate-200 sticky top-0 z-50;
    }

    .header-container {
      @apply max-w-[1200px] mx-auto px-6 py-4 flex items-center gap-6;
    }

    .logo {
      @apply flex items-center no-underline flex-shrink-0;
    }

    .logo-img {
      @apply h-10 w-auto object-contain;
    }

    .logo-text {
      @apply text-xl font-bold text-primary;
    }

    .main-nav {
      @apply flex gap-6 flex-1 justify-center;
    }

    .main-nav a {
      @apply text-secondary font-medium no-underline px-3 py-2 rounded-md transition-all duration-150;
      &:hover { @apply text-slate-800 bg-slate-100; }
      &.active { @apply text-primary bg-emerald-50; }
    }

    .header-actions {
      @apply flex items-center gap-4;
    }

    @media (max-width: 768px) {
      .header-container { @apply flex-wrap; }
      .main-nav {
        @apply order-3 w-full justify-start gap-2;
        a { @apply text-sm py-2 px-2; }
      }
    }
  `],
})
export class HeaderComponent {
  @Input() companyName: string = "Simplifica CRM";
  @Input() logoUrl?: string;
}
