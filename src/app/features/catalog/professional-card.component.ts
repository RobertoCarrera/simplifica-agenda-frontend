import { Component, Input } from "@angular/core";
import { RouterLink } from "@angular/router";
import { TranslocoModule } from "@jsverse/transloco";
import { Professional } from "../../services/booking-public.service";

@Component({
  selector: "app-professional-card",
  standalone: true,
  imports: [RouterLink, TranslocoModule],
  template: `
    <div class="professional-card">
      <div class="professional-avatar">
        <img
          *ngIf="professional.avatar_url; else initials"
          [src]="professional.avatar_url"
          [alt]="professional.display_name"
        />
        <ng-template #initials>
          <span class="initials">{{
            getInitials(professional.display_name)
          }}</span>
        </ng-template>
      </div>

      <div class="professional-info">
        <h3 class="professional-name">{{ professional.display_name }}</h3>

        <div class="professional-services" *ngIf="serviceNames?.length">
          <span class="service-tag" *ngFor="let name of serviceNames">
            {{ name }}
          </span>
        </div>
      </div>

      <div class="professional-actions">
        <a
          [routerLink]="['/profesionales', professional.id]"
          class="btn btn-outline"
        >
          {{ "catalog.viewProfile" | transloco }}
        </a>
        <a
          [routerLink]="['/reservar']"
          [queryParams]="{ professional: professional.id }"
          class="btn btn-primary"
        >
          {{ "catalog.bookWith" | transloco }}
        </a>
      </div>
    </div>
  `,
  styles: [
    `
      .professional-card {
        background: var(--color-surface);
        border-radius: var(--radius-lg);
        padding: var(--space-6);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-4);
        transition:
          transform var(--transition-fast),
          box-shadow var(--transition-fast);
        border: 1px solid var(--color-border);
        text-align: center;
      }

      .professional-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
      }

      .professional-avatar {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        overflow: hidden;
        background: var(--color-primary);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .professional-avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .initials {
        font-size: var(--font-size-2xl);
        font-weight: var(--font-weight-bold);
        color: var(--color-primary-text);
      }

      .professional-info {
        flex: 1;
      }

      .professional-name {
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text-primary);
        margin: 0 0 var(--space-3) 0;
      }

      .professional-services {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: var(--space-2);
      }

      .service-tag {
        background: var(--color-secondary-light);
        color: var(--color-secondary);
        border: 1px solid color-mix(in srgb, var(--color-secondary) 30%, transparent);
        padding: var(--space-1) var(--space-3);
        border-radius: var(--radius-full);
        font-size: var(--font-size-xs);
      }

      .professional-actions {
        display: flex;
        gap: var(--space-3);
        width: 100%;
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
        background: var(--color-primary);
        border: 1px solid var(--color-primary);
        color: var(--color-primary-text);
      }

      .btn-primary:hover {
        filter: brightness(1.1);
      }
    `,
  ],
})
export class ProfessionalCardComponent {
  @Input({ required: true }) professional!: Professional;
  @Input() serviceNames?: string[];

  getInitials(name: string): string {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
}
