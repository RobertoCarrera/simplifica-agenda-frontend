import { Component, OnInit, inject, signal } from "@angular/core";
import { ActivatedRoute, RouterLink, RouterLinkActive } from "@angular/router";
import { TranslocoModule } from "@jsverse/transloco";
import { CommonModule } from "@angular/common";
import {
  BookingPublicService,
  Company,
  Service,
  Professional,
} from "../../services/booking-public.service";

@Component({
  selector: "app-catalog",
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslocoModule, CommonModule],
  template: `
    <div class="catalog-page">
      <header class="page-header">
        <h1>{{ company()?.name || "Servicios" }}</h1>
        <p>{{ "catalog.subtitle" | transloco }}</p>
      </header>

      <nav class="catalog-nav">
        <a [routerLink]="['/', slug(), 'servicios']" routerLinkActive="active">
          {{ "nav.services" | transloco }}
        </a>
        <a
          [routerLink]="['/', slug(), 'profesionales']"
          routerLinkActive="active"
        >
          {{ "nav.professionals" | transloco }}
        </a>
      </nav>

      <div class="catalog-content">
        @if (loading()) {
          <div class="loading-state">
            <p>{{ "common.loading" | transloco }}</p>
          </div>
        } @else if (error()) {
          <div class="error-state">
            <p>{{ error() }}</p>
          </div>
        } @else if (services().length === 0) {
          <p class="text-muted text-center">
            {{ "catalog.noServices" | transloco }}
          </p>
        } @else {
          <div class="services-grid">
            @for (service of services(); track service.id) {
              <div class="service-card">
                <div class="service-header">
                  <h3>{{ service.name }}</h3>
                  <span class="price">{{ service.price }}€</span>
                </div>
                <p class="service-description" *ngIf="service.description">
                  {{ service.description }}
                </p>
                <div class="service-footer">
                  <span class="duration"
                    >{{ service.duration_minutes }} min</span
                  >
                  <a
                    [routerLink]="['/', slug(), 'servicios', service.id]"
                    class="btn btn-outline"
                  >
                    {{ "common.details" | transloco }}
                  </a>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .catalog-page {
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

      .catalog-content {
        min-height: 300px;
      }

      .services-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: var(--space-6);
      }

      .service-card {
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg);
        padding: var(--space-6);
        transition: all var(--transition-fast);

        &:hover {
          border-color: var(--color-primary);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
      }

      .service-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: var(--space-4);

        h3 {
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-semibold);
          margin: 0;
          color: var(--color-text-primary);
        }

        .price {
          font-size: var(--font-size-xl);
          font-weight: var(--font-weight-bold);
          color: var(--color-primary);
        }
      }

      .service-description {
        color: var(--color-text-secondary);
        font-size: var(--font-size-sm);
        margin-bottom: var(--space-4);
        line-height: 1.5;
      }

      .service-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: var(--space-4);
        padding-top: var(--space-4);
        border-top: 1px solid var(--color-border);

        .duration {
          font-size: var(--font-size-sm);
          color: var(--color-text-secondary);
        }
      }

      .btn {
        padding: var(--space-2) var(--space-4);
        border-radius: var(--radius-md);
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);
        text-decoration: none;
        transition: all var(--transition-fast);
      }

      .btn-outline {
        background: transparent;
        border: 1px solid var(--color-border);
        color: var(--color-text-primary);

        &:hover {
          border-color: var(--color-primary);
          color: var(--color-primary);
        }
      }

      .loading-state,
      .error-state {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 300px;
      }

      .error-state {
        color: var(--color-error);
      }
    `,
  ],
})
export class CatalogComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private bookingService = inject(BookingPublicService);

  company = signal<Company | null>(null);
  services = signal<Service[]>([]);
  professionals = signal<Professional[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  slug = signal<string>("");

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const slugParam = params.get("slug");
      if (slugParam) {
        this.slug.set(slugParam);
        this.loadCompanyAndServices(slugParam);
      }
    });

    // Also check resolved data from route
    this.route.data.subscribe((data) => {
      if (data["company"]) {
        this.company.set(data["company"] as Company);
      }
    });
  }

  private loadCompanyAndServices(slug: string) {
    this.loading.set(true);
    this.error.set(null);

    this.bookingService.getServices(slug).subscribe({
      next: (response) => {
        this.company.set(response.company);
        this.services.set(response.services);
        this.professionals.set(response.professionals);
        this.loading.set(false);
      },
      error: (err) => {
        console.error("Error loading services:", err);
        this.error.set("Error loading services");
        this.loading.set(false);
      },
    });
  }
}
