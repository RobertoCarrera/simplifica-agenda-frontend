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
        @apply bg-slate-50 rounded-xl p-6 flex flex-col items-center gap-4 border border-slate-200 text-center;
        transition: transform 150ms ease, box-shadow 150ms ease;
        &:hover { transform: translateY(-2px); @apply shadow-lg; }
      }

      .professional-avatar {
        @apply w-20 h-20 rounded-full overflow-hidden bg-primary flex items-center justify-center;
        img { @apply w-full h-full object-cover; }
      }

      .initials { @apply text-2xl font-bold text-white; }

      .professional-info { @apply flex-1; }

      .professional-name {
        @apply text-lg font-semibold text-slate-800 m-0 mb-3;
      }

      .professional-services {
        @apply flex flex-wrap justify-center gap-2;
      }

      .service-tag {
        @apply bg-slate-100 text-secondary border border-slate-300 px-3 py-0.5 rounded-full text-xs;
      }

      .professional-actions { @apply flex gap-3 w-full; }

      .btn {
        @apply flex-1 px-4 py-3 rounded-md font-medium text-center no-underline text-sm transition-all duration-150;
      }

      .btn-outline { @apply bg-transparent border border-slate-200 text-slate-800; &:hover { @apply bg-slate-100; } }

      .btn-primary {
        @apply bg-primary border border-primary text-white;
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
