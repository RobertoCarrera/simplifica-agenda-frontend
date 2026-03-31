import { Component, OnInit, inject, signal, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { TranslocoModule } from "@jsverse/transloco";
import {
  BookingPublicService,
  Service,
  Professional,
  Company,
} from "../../services/booking-public.service";

@Component({
  selector: "app-service-detail",
  standalone: true,
  imports: [CommonModule, RouterLink, TranslocoModule],
  template: `
    <div class="service-detail-page" *ngIf="service(); else loading">
      <header class="detail-header">
        <a [routerLink]="['/', slug(), 'servicios']" class="back-link">
          ← {{ "common.back" | transloco }}
        </a>

        <div class="service-header-content">
          <h1 class="service-title">{{ service()?.name }}</h1>
          <div class="service-price-duration">
            <span class="price">{{ service()?.price }}€</span>
            <span class="duration">{{ service()?.duration_minutes }} min</span>
          </div>
        </div>
      </header>

      <section class="service-description" *ngIf="service()?.description">
        <p>{{ service()?.description }}</p>
      </section>

      <section class="professionals-section">
        <h2>{{ "service.availableWith" | transloco }}</h2>
        <div class="professionals-grid">
          <div
            class="professional-item"
            *ngFor="let prof of professionalsForService()"
            (click)="bookWithProfessional(prof)"
          >
            <div class="prof-avatar">
              <img
                *ngIf="prof.avatar_url; else initials"
                [src]="prof.avatar_url"
                [alt]="prof.display_name"
              />
              <ng-template #initials>
                <span class="initials">{{
                  getInitials(prof.display_name)
                }}</span>
              </ng-template>
            </div>
            <div class="prof-info">
              <span class="prof-name">{{ prof.display_name }}</span>
              <span class="book-link"
                >{{ "service.bookWith" | transloco }} →</span
              >
            </div>
          </div>
        </div>
      </section>

      <div class="actions">
        <a
          [routerLink]="['/', slug(), 'reservar', service()?.id]"
          class="btn btn-primary btn-lg"
        >
          {{ "service.bookNow" | transloco }}
        </a>
      </div>
    </div>

    <ng-template #loading>
      <div class="loading-state">
        <p>{{ "common.loading" | transloco }}</p>
      </div>
    </ng-template>

    <div class="error-state" *ngIf="error()">
      <p>{{ error() }}</p>
      <a [routerLink]="['/', slug(), 'servicios']" class="btn btn-outline">
        {{ "common.backToServices" | transloco }}
      </a>
    </div>
  `,
  styles: [
    `
      .service-detail-page {
        max-width: 800px;
        margin: 0 auto;
        padding: var(--space-8) var(--space-4);
      }

      .detail-header {
        margin-bottom: var(--space-8);
      }

      .back-link {
        display: inline-block;
        color: var(--color-text-secondary);
        text-decoration: none;
        margin-bottom: var(--space-6);
        transition: color var(--transition-fast);
      }

      .back-link:hover {
        color: var(--color-text-primary);
      }

      .service-header-content {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: var(--space-4);
      }

      .service-title {
        font-size: var(--font-size-3xl);
        font-weight: var(--font-weight-bold);
        color: var(--color-text-primary);
        margin: 0;
      }

      .service-price-duration {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: var(--space-1);
      }

      .price {
        font-size: var(--font-size-2xl);
        font-weight: var(--font-weight-bold);
        color: var(--color-primary);
      }

      .duration {
        font-size: var(--font-size-sm);
        color: var(--color-text-secondary);
      }

      .service-description {
        margin-bottom: var(--space-8);
        padding: var(--space-6);
        background: var(--color-surface);
        border-radius: var(--radius-lg);
        border: 1px solid var(--color-border);
      }

      .service-description p {
        margin: 0;
        color: var(--color-text-secondary);
        line-height: 1.6;
      }

      .professionals-section {
        margin-bottom: var(--space-8);
      }

      .professionals-section h2 {
        font-size: var(--font-size-xl);
        font-weight: var(--font-weight-semibold);
        margin: 0 0 var(--space-4) 0;
      }

      .professionals-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: var(--space-4);
      }

      .professional-item {
        display: flex;
        align-items: center;
        gap: var(--space-4);
        padding: var(--space-4);
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg);
        cursor: pointer;
        transition: all var(--transition-fast);
      }

      .professional-item:hover {
        border-color: var(--color-primary);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .prof-avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        overflow: hidden;
        background: var(--color-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .prof-avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .initials {
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-bold);
        color: white;
      }

      .prof-info {
        display: flex;
        flex-direction: column;
        gap: var(--space-1);
      }

      .prof-name {
        font-weight: var(--font-weight-medium);
        color: var(--color-text-primary);
      }

      .book-link {
        font-size: var(--font-size-sm);
        color: var(--color-primary);
      }

      .actions {
        display: flex;
        justify-content: center;
      }

      .btn-lg {
        padding: var(--space-4) var(--space-8);
        font-size: var(--font-size-lg);
      }

      .btn {
        border-radius: var(--radius-md);
        font-weight: var(--font-weight-medium);
        text-align: center;
        text-decoration: none;
        transition: all var(--transition-fast);
      }

      .btn-primary {
        background: var(--color-primary);
        border: 1px solid var(--color-primary);
        color: white;
      }

      .btn-primary:hover {
        filter: brightness(1.1);
      }

      .btn-outline {
        background: transparent;
        border: 1px solid var(--color-border);
        color: var(--color-text-primary);
      }

      .loading-state,
      .error-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 300px;
        gap: var(--space-4);
      }

      .error-state {
        color: var(--color-error);
      }
    `,
  ],
})
export class ServiceDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private bookingService = inject(BookingPublicService);

  service = signal<Service | null>(null);
  professionals = signal<Professional[]>([]);
  company = signal<Company | null>(null);
  error = signal<string | null>(null);
  slug = signal<string>("");

  ngOnInit() {
    // Get slug from route
    this.route.paramMap.subscribe((params) => {
      const slugParam = params.get("slug");
      if (slugParam) {
        this.slug.set(slugParam);
      }
    });

    // Get resolved service data
    this.route.data.subscribe((data) => {
      if (data["service"]) {
        this.service.set(data["service"] as Service);
        this.professionals.set(data["service"]["professionals"] || []);
      }
    });

    // Also check route param for service ID (fallback)
    const serviceId = this.route.snapshot.paramMap.get("id");
    if (serviceId && !this.service()) {
      this.loadService(serviceId);
    }
  }

  private loadService(id: string) {
    this.error.set(null);

    this.bookingService.getService(id).subscribe({
      next: (service) => {
        this.service.set(service);
        this.professionals.set(service.professionals || []);
      },
      error: (err) => {
        console.error("Error loading service:", err);
        this.error.set("Service not found");
      },
    });
  }

  professionalsForService(): Professional[] {
    const service = this.service();
    if (!service) return [];
    return service.professionals || [];
  }

  getInitials(name: string): string {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  bookWithProfessional(professional: Professional) {
    const currentSlug = this.slug();
    this.router.navigate(["/", currentSlug, "reservar", this.service()?.id], {
      queryParams: { professional: professional.id },
    });
  }
}
