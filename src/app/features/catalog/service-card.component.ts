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
          {{ service.duration_minutes }} min
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
  styles: [`
    :host { display: block; }

    .service-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 0.75rem;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      transition: transform 150ms ease, box-shadow 150ms ease;
    }
    .service-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
    }

    .service-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
    }

    .service-name {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--color-text);
      margin: 0;
    }

    .service-price {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--color-text-secondary);
    }

    .service-meta {
      display: flex;
      gap: 1rem;
      font-size: 0.875rem;
      color: var(--color-text-secondary);
    }

    .service-duration {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .service-actions {
      display: flex;
      gap: 0.75rem;
      margin-top: auto;
    }

    .btn {
      flex: 1;
      padding: 0.75rem 1rem;
      border-radius: 0.375rem;
      font-weight: 500;
      font-size: 0.875rem;
      text-align: center;
      text-decoration: none;
      transition: all 150ms ease;
    }

    .btn-outline {
      background: transparent;
      border: 1px solid var(--color-border);
      color: var(--color-text);
    }
    .btn-outline:hover { background: var(--color-surface-hover); }

    .btn-primary {
      background: var(--primary-color, var(--color-primary));
      border: 1px solid transparent;
      color: var(--color-primary-text);
    }
    .btn-primary:hover { filter: brightness(1.1); }
  `],
})
export class ServiceCardComponent {
  @Input({ required: true }) service!: Service;
  @Input() primaryColor?: string;
}
