import { Component, Input } from "@angular/core";
import { RouterLink } from "@angular/router";
import { TranslocoModule } from "@jsverse/transloco";
import { Service } from "../../services/booking-public.service";

@Component({
  selector: "app-service-card",
  standalone: true,
  imports: [RouterLink, TranslocoModule],
  template: `
    <div class="service-card" [style.--primary-color]="primaryColor">
      <div class="service-header">
        <h3 class="service-name">{{ service.name }}</h3>
        <span class="service-price">{{ service.price }}€</span>
      </div>

      <div class="service-meta">
        <span class="service-duration">
          <i class="icon-clock"></i>
          {{ service.duration }} min
        </span>
      </div>

      <div class="service-actions">
        <a [routerLink]="['/servicios', service.id]" class="btn btn-outline">
          {{ "catalog.viewDetails" | transloco }}
        </a>
        <a [routerLink]="['/reservar', service.id]" class="btn btn-primary">
          {{ "catalog.bookNow" | transloco }}
        </a>
      </div>
    </div>
  `,
  styles: [
    `
      .service-card {
        background: var(--color-surface);
        border-radius: var(--radius-lg);
        padding: var(--space-6);
        display: flex;
        flex-direction: column;
        gap: var(--space-4);
        transition:
          transform var(--transition-fast),
          box-shadow var(--transition-fast);
        border: 1px solid var(--color-border);
      }

      .service-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
      }

      .service-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: var(--space-4);
      }

      .service-name {
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text-primary);
        margin: 0;
      }

      .service-price {
        font-size: var(--font-size-xl);
        font-weight: var(--font-weight-bold);
        color: var(--primary-color, var(--color-primary));
      }

      .service-meta {
        display: flex;
        gap: var(--space-4);
        color: var(--color-text-secondary);
        font-size: var(--font-size-sm);
      }

      .service-duration {
        display: flex;
        align-items: center;
        gap: var(--space-2);
      }

      .service-actions {
        display: flex;
        gap: var(--space-3);
        margin-top: auto;
      }

      .btn {
        flex: 1;
        padding: var(--space-3) var(--space-4);
        border-radius: var(--radius-md);
        font-weight: var(--font-weight-medium);
        text-align: center;
        text-decoration: none;
        font-size: var(--font-size-sm);
        transition: all var(--transition-fast);
      }

      .btn-outline {
        background: transparent;
        border: 1px solid var(--color-border);
        color: var(--color-text-primary);
      }

      .btn-outline:hover {
        background: var(--color-surface-hover);
      }

      .btn-primary {
        background: var(--primary-color, var(--color-primary));
        border: 1px solid var(--primary-color, var(--color-primary));
        color: white;
      }

      .btn-primary:hover {
        filter: brightness(1.1);
      }
    `,
  ],
})
export class ServiceCardComponent {
  @Input({ required: true }) service!: Service;
  @Input() primaryColor?: string;
}
