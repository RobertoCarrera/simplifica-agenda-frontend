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
      @apply bg-slate-50 rounded-xl p-6 flex flex-col gap-4 border border-slate-200;
      transition: transform 150ms ease, box-shadow 150ms ease;
      &:hover {
        transform: translateY(-2px);
        @apply shadow-lg;
      }
    }

    .service-header {
      @apply flex justify-between items-start gap-4;
    }

    .service-name {
      @apply text-lg font-semibold text-slate-800 m-0;
    }

    .service-price {
      @apply text-xl font-bold text-secondary;
    }

    .service-meta {
      @apply flex gap-4 text-sm text-secondary;
    }

    .service-duration {
      @apply flex items-center gap-2;
    }

    .service-actions {
      @apply flex gap-3 mt-auto;
    }

    .btn {
      @apply flex-1 px-4 py-3 rounded-md font-medium text-center no-underline text-sm transition-all duration-150;
    }

    .btn-outline {
      @apply bg-transparent border border-slate-200 text-slate-800;
      &:hover { @apply bg-slate-100; }
    }

    .btn-primary {
      background: var(--primary-color, #10B981);
      @apply border-transparent text-white;
      &:hover { filter: brightness(1.1); }
    }
  `],
})
export class ServiceCardComponent {
  @Input({ required: true }) service!: Service;
  @Input() primaryColor?: string;
}
