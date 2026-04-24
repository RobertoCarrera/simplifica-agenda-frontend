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
      background: var(--color-surface);
      border-bottom: 1px solid var(--color-border);
      position: sticky;
      top: 0;
      z-index: 50;
    }

    .header-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1.5rem 1.5rem;
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .logo {
      display: flex;
      align-items: center;
      text-decoration: none;
      flex-shrink: 0;
    }

    .logo-img {
      height: 2.5rem;
      width: auto;
      object-fit: contain;
    }

    .logo-text {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--color-primary);
    }

    .main-nav {
      display: flex;
      gap: 1.5rem;
      flex: 1;
      justify-content: center;
    }

    .main-nav a {
      font-weight: 500;
      text-decoration: none;
      padding: 0.5rem 0.75rem;
      border-radius: 0.375rem;
      transition: all 150ms ease;
      color: var(--color-text-secondary);
    }
    .main-nav a:hover {
      background: var(--color-surface-hover);
      color: var(--color-text);
    }
    .main-nav a.active {
      color: var(--color-primary);
      background: var(--color-primary-light);
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    @media (max-width: 768px) {
      .header-container { flex-wrap: wrap; }
      .main-nav {
        order: 3;
        width: 100%;
        justify-content: flex-start;
        gap: 0.5rem;
      }
      .main-nav a { font-size: 0.875rem; padding: 0.5rem; }
    }
  `],
})
export class HeaderComponent {
  @Input() companyName: string = "Simplifica CRM";
  @Input() logoUrl?: string;
}
