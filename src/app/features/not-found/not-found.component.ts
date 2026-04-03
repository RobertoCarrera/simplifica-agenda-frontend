import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import { TranslocoModule } from "@jsverse/transloco";

@Component({
  selector: "app-not-found",
  standalone: true,
  imports: [RouterLink, TranslocoModule],
  template: `
    <div class="not-found-page">
      <div class="content">
        <h1 class="error-code">404</h1>
        <h2 class="title">{{ "notFound.title" | transloco }}</h2>
        <p class="description">{{ "notFound.description" | transloco }}</p>

        <div class="actions">
          <a routerLink="/" class="btn btn-primary">
            {{ "notFound.goHome" | transloco }}
          </a>
          <a routerLink="/servicios" class="btn btn-outline">
            {{ "notFound.viewServices" | transloco }}
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .not-found-page {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--space-8);
      }

      .content {
        text-align: center;
        max-width: 500px;
      }

      .error-code {
        font-size: 120px;
        font-weight: var(--font-weight-bold);
        color: var(--color-primary);
        margin: 0;
        line-height: 1;
      }

      .title {
        font-size: var(--font-size-2xl);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text-primary);
        margin: var(--space-4) 0;
      }

      .description {
        color: var(--color-text-secondary);
        font-size: var(--font-size-lg);
        margin-bottom: var(--space-8);
      }

      .actions {
        display: flex;
        gap: var(--space-4);
        justify-content: center;
      }

      .btn {
        padding: var(--space-3) var(--space-6);
        border-radius: var(--radius-md);
        font-weight: var(--font-weight-medium);
        text-decoration: none;
        transition: all var(--transition-fast);
      }

      .btn-primary {
        background: var(--color-primary);
        border: 1px solid var(--color-primary);
        color: var(--color-primary-text);
      }

      .btn-primary:hover {
        filter: brightness(1.1);
      }

      .btn-outline {
        background: transparent;
        border: 1px solid var(--color-border);
        color: var(--color-text-primary);
      }

      .btn-outline:hover {
        background: var(--color-surface-hover);
      }

      @media (max-width: 480px) {
        .error-code {
          font-size: 80px;
        }

        .actions {
          flex-direction: column;
        }
      }
    `,
  ],
})
export class NotFoundComponent {}
