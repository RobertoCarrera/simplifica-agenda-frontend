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
  styles: [
    `
      .site-header {
        background: var(--color-surface);
        border-bottom: 1px solid var(--color-border);
        position: sticky;
        top: 0;
        z-index: 100;
      }

      .header-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: var(--space-4) var(--space-6);
        display: flex;
        align-items: center;
        gap: var(--space-6);
      }

      .logo {
        display: flex;
        align-items: center;
        text-decoration: none;
        flex-shrink: 0;
      }

      .logo-img {
        height: 40px;
        width: auto;
        object-fit: contain;
      }

      .logo-text {
        font-size: var(--font-size-xl);
        font-weight: var(--font-weight-bold);
        color: var(--color-primary);
      }

      .main-nav {
        display: flex;
        gap: var(--space-6);
        flex: 1;
        justify-content: center;
      }

      .main-nav a {
        color: var(--color-text-secondary);
        text-decoration: none;
        font-weight: var(--font-weight-medium);
        padding: var(--space-2) var(--space-3);
        border-radius: var(--radius-md);
        transition: all var(--transition-fast);
      }

      .main-nav a:hover {
        color: var(--color-text-primary);
        background: var(--color-surface-hover);
      }

      .main-nav a.active {
        color: var(--color-primary);
        background: var(--color-primary-light);
      }

      .header-actions {
        display: flex;
        align-items: center;
        gap: var(--space-4);
      }

      @media (max-width: 768px) {
        .header-container {
          flex-wrap: wrap;
        }

        .main-nav {
          order: 3;
          width: 100%;
          justify-content: flex-start;
          gap: var(--space-2);
        }

        .main-nav a {
          font-size: var(--font-size-sm);
          padding: var(--space-2);
        }
      }
    `,
  ],
})
export class HeaderComponent {
  @Input() companyName: string = "Simplifica CRM";
  @Input() logoUrl?: string;
}
