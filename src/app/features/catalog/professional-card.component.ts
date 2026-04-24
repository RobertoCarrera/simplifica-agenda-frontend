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
        border: 1px solid var(--color-border);
        border-radius: 0.75rem;
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        text-align: center;
        transition: transform 150ms ease, box-shadow 150ms ease;
      }
      .professional-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0,0,0,0.12);
      }

      .professional-avatar {
        width: 5rem;
        height: 5rem;
        border-radius: 50%;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--color-primary);
      }
      .professional-avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .initials { font-size: 1.5rem; font-weight: 700; color: var(--color-primary-text); }

      .professional-info { flex: 1; }

      .professional-name {
        font-size: 1.125rem;
        font-weight: 600;
        margin: 0 0 0.75rem;
        color: var(--color-text);
      }

      .professional-services {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 0.5rem;
      }

      .service-tag {
        padding: 0.125rem 0.75rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        background: var(--color-surface-hover);
        border: 1px solid var(--color-border);
        color: var(--color-text-secondary);
      }

      .professional-actions { display: flex; gap: 0.75rem; width: 100%; }

      .btn {
        flex: 1;
        padding: 0.75rem 1rem;
        border-radius: 0.375rem;
        font-weight: 500;
        text-align: center;
        text-decoration: none;
        font-size: 0.875rem;
        transition: all 150ms ease;
      }

      .btn-outline {
        background: transparent;
        border: 1px solid var(--color-border);
        color: var(--color-text);
      }
      .btn-outline:hover { background: var(--color-surface-hover); }

      .btn-primary {
        background: var(--color-primary);
        border: 1px solid var(--color-primary);
        color: var(--color-primary-text);
      }
      .btn-primary:hover { filter: brightness(1.1); }
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
