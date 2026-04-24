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
        @apply rounded-xl p-6 flex flex-col items-center gap-4 text-center;
        transition: transform 150ms ease, box-shadow 150ms ease;
        &:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
      }

      .professional-avatar {
        @apply w-20 h-20 rounded-full overflow-hidden flex items-center justify-center;
        background: var(--color-primary);
        img { @apply w-full h-full object-cover; }
      }

      .initials { @apply text-2xl font-bold; color: var(--color-primary-text); }

      .professional-info { @apply flex-1; }

      .professional-name {
        @apply text-lg font-semibold m-0 mb-3;
        color: var(--color-text);
      }

      .professional-services {
        @apply flex flex-wrap justify-center gap-2;
      }

      .service-tag {
        @apply px-3 py-0.5 rounded-full text-xs;
        background: var(--color-surface-hover);
        border: 1px solid var(--color-border);
        color: var(--color-text-secondary);
      }

      .professional-actions { @apply flex gap-3 w-full; }

      .btn {
        @apply flex-1 px-4 py-3 rounded-md font-medium text-center no-underline text-sm transition-all duration-150;
      }

      .btn-outline {
        background: transparent;
        border: 1px solid var(--color-border);
        color: var(--color-text);
        &:hover { background: var(--color-surface-hover); }
      }

      .btn-primary {
        background: var(--color-primary);
        border: 1px solid var(--color-primary);
        color: var(--color-primary-text);
        &:hover { filter: brightness(1.1); }
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
