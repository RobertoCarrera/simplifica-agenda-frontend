import { Component } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { TranslocoModule } from "@jsverse/transloco";

@Component({
  selector: "app-professionals",
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslocoModule],
  template: `
    <div class="professionals-page">
      <header class="page-header">
        <h1>{{ "professionals.title" | transloco }}</h1>
        <p>{{ "professionals.subtitle" | transloco }}</p>
      </header>

      <nav class="catalog-nav">
        <a routerLink="/servicios" routerLinkActive="active">{{
          "nav.services" | transloco
        }}</a>
        <a routerLink="/profesionales" routerLinkActive="active">{{
          "nav.professionals" | transloco
        }}</a>
      </nav>

      <div class="professionals-content">
        <p class="text-muted text-center">
          {{ "professionals.noProfessionals" | transloco }}
        </p>
      </div>
    </div>
  `,
  styles: [
    `
      .professionals-page {
        max-width: 1200px;
        margin: 0 auto;
        padding: var(--space-8) var(--space-4);
      }

      .page-header {
        text-align: center;
        margin-bottom: var(--space-8);

        h1 {
          font-size: var(--font-size-3xl);
          margin-bottom: var(--space-2);
        }

        p {
          color: var(--color-text-secondary);
          font-size: var(--font-size-lg);
        }
      }

      .catalog-nav {
        display: flex;
        justify-content: center;
        gap: var(--space-4);
        margin-bottom: var(--space-8);

        a {
          padding: var(--space-3) var(--space-6);
          border-radius: var(--radius-full);
          color: var(--color-text-secondary);
          font-weight: var(--font-weight-medium);
          transition: all var(--transition-fast);

          &:hover {
            background: var(--color-surface);
            color: var(--color-text-primary);
          }

          &.active {
            background: var(--color-primary);
            color: white;
          }
        }
      }

      .professionals-content {
        min-height: 300px;
      }
    `,
  ],
})
export class ProfessionalsComponent {}
