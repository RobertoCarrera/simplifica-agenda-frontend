import { Component, OnInit, inject, signal, computed } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { TranslocoModule } from "@jsverse/transloco";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import {
  BookingPublicService,
  Company,
  Service,
  Professional,
} from "../../services/booking-public.service";
import { applyBrandingColors } from "../../shared/branding.utils";
import { StripHtmlPipe } from "../../shared/pipes/strip-html.pipe";

type Journey = "services" | "professionals" | "duration";
type SortOrder = "default" | "price-asc" | "price-desc" | "duration-asc" | "name";

interface DurationGroup {
  label: string;
  desc: string;
  icon: string;
  min: number;
  max: number;
  color: string;
}

@Component({
  selector: "app-catalog",
  standalone: true,
  imports: [RouterLink, TranslocoModule, CommonModule, FormsModule, StripHtmlPipe],
  template: `
    @if (loading()) {
      <div class="catalog-loading">
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton-tabs">
          <div class="skeleton skeleton-tab"></div>
          <div class="skeleton skeleton-tab"></div>
          <div class="skeleton skeleton-tab"></div>
        </div>
        <div class="skeleton-grid">
          <div class="skeleton skeleton-card"></div>
          <div class="skeleton skeleton-card"></div>
          <div class="skeleton skeleton-card"></div>
          <div class="skeleton skeleton-card"></div>
        </div>
      </div>
    } @else if (error()) {
      <div class="error-state">
        <div class="error-icon">⚠</div>
        <h2>{{ "errors.companyNotFound" | transloco }}</h2>
        <p>{{ error() }}</p>
        <button class="btn btn-primary" (click)="reload()">
          {{ "errors.tryAgain" | transloco }}
        </button>
      </div>
    } @else {
      <div class="catalog-page">
        <div class="catalog-hero">
          <header class="page-header">
            <div class="page-header-identity">
              @if (company()?.logo_url) {
                <img class="company-logo" [src]="company()!.logo_url" [alt]="company()?.name" />
              } @else {
                <div class="company-logo-placeholder">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                </div>
              }
              <h1>{{ company()?.name }}</h1>
            </div>
            <p class="page-subtitle">Reserva tu cita online en pocos pasos</p>
          </header>

          <!-- Journey tabs -->
          <div class="journey-tabs">
          <button
            class="journey-tab"
            [class.active]="activeTab() === 'services'"
            (click)="setTab('services')"
          >
            <svg class="tab-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
            Por Servicio
          </button>
          <button
            class="journey-tab"
            [class.active]="activeTab() === 'professionals'"
            (click)="setTab('professionals')"
          >
            <svg class="tab-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            Por Profesional
          </button>
          <button
            class="journey-tab"
            [class.active]="activeTab() === 'duration'"
            (click)="setTab('duration')"
          >
            <svg class="tab-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Por Duración
          </button>
          </div>
        </div>

        <!-- ── VIEW: Por Servicio ─────────────────────────────────────── -->
        @if (activeTab() === 'services') {
          <div class="view-services">
            <div class="sort-row">
              <span class="count-label">
                {{ services().length }} servicio{{ services().length !== 1 ? 's' : '' }} disponible{{ services().length !== 1 ? 's' : '' }}
              </span>
              <select class="sort-select" [(ngModel)]="sortOrderValue" (ngModelChange)="sortOrder.set($any($event))">
                <option value="default">Orden por defecto</option>
                <option value="price-asc">Precio: menor a mayor</option>
                <option value="price-desc">Precio: mayor a menor</option>
                <option value="duration-asc">Duración: menor a mayor</option>
                <option value="name">Nombre A–Z</option>
              </select>
            </div>
            <div class="services-grid">
              @for (svc of sortedServices(); track svc.id) {
                <ng-container *ngTemplateOutlet="serviceCard; context: { $implicit: svc, profId: null }"></ng-container>
              }
            </div>
          </div>
        }

        <!-- ── VIEW: Por Profesional ─────────────────────────────────── -->
        @if (activeTab() === 'professionals') {
          @if (selectedProfessional()) {
            <!-- Professional detail -->
            <div class="view-prof-detail">
              <button class="back-btn" (click)="backToProfList()">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width:1rem;height:1rem">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
                Volver al equipo
              </button>
              <div class="prof-detail-header">
                @if (selectedProfessional()?.avatar_url && !failedAvatarIds().has(selectedProfessional()!.id)) {
                  <img [src]="selectedProfessional()!.avatar_url" [alt]="selectedProfessional()!.display_name" class="prof-detail-avatar" (error)="onAvatarError(selectedProfessional()!.id)" />
                } @else {
                  <div class="prof-detail-avatar-placeholder"
                    [style.background]="getAvatarColor(selectedProfessional()!.display_name).bg"
                    [style.color]="getAvatarColor(selectedProfessional()!.display_name).fg">
                    {{ getInitials(selectedProfessional()!.display_name) }}
                  </div>
                }
                <div>
                  <h2 class="prof-detail-name">{{ selectedProfessional()!.display_name }}</h2>
                  <p class="prof-detail-cta">Reserva directamente con este profesional</p>
                </div>
              </div>
              <h3 class="section-label">Servicios disponibles</h3>
              <div class="services-grid">
                @for (svc of (selectedProfessional()!.services ?? []); track svc.id) {
                  <ng-container *ngTemplateOutlet="serviceCard; context: { $implicit: svc, profId: selectedProfessional()!.id }"></ng-container>
                }
              </div>
            </div>
          } @else {
            <!-- Professionals grid -->
            <div class="professionals-view">
              <p class="count-label">
                {{ professionals().length }} profesional{{ professionals().length !== 1 ? 'es' : '' }} disponible{{ professionals().length !== 1 ? 's' : '' }}
              </p>
              <div class="professionals-grid">
                @for (prof of professionals(); track prof.id) {
                  <div class="prof-card" (click)="showProfessionalDetail(prof)">
                    <div class="prof-card-avatar-wrap">
                      @if (prof.avatar_url && !failedAvatarIds().has(prof.id)) {
                        <img [src]="prof.avatar_url" [alt]="prof.display_name" class="prof-card-avatar-img" (error)="onAvatarError(prof.id)" />
                      } @else {
                        <div class="prof-card-avatar-initials"
                          [style.background]="getAvatarColor(prof.display_name).bg"
                          [style.color]="getAvatarColor(prof.display_name).fg">
                          {{ getInitials(prof.display_name) }}
                        </div>
                      }
                    </div>
                    <div class="prof-card-info">
                      <p class="prof-card-name">{{ prof.display_name }}</p>
                      <div class="prof-card-tags">
                        @for (svc of (prof.services ?? []).slice(0, 2); track svc.id) {
                          <span class="prof-tag">{{ svc.name }}</span>
                        }
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>
          }
        }

        <!-- ── VIEW: Por Duración ─────────────────────────────────────── -->
        @if (activeTab() === 'duration') {
          <div class="view-duration">
            @for (group of durationGroups; track group.label) {
              @if (getGroupServices(group).length > 0) {
                <div class="duration-group">
                  <div class="duration-group-header">
                    <div class="duration-group-icon" [style.background]="group.color + '1a'">{{ group.icon }}</div>
                    <div>
                      <h3 class="duration-group-title">{{ group.label }}</h3>
                      <p class="duration-group-desc">{{ group.desc }}</p>
                    </div>
                    <span class="duration-group-count ml-auto">
                      {{ getGroupServices(group).length }} servicio{{ getGroupServices(group).length !== 1 ? 's' : '' }}
                    </span>
                  </div>
                  <div class="services-grid">
                    @for (svc of getGroupServices(group); track svc.id) {
                      <ng-container *ngTemplateOutlet="serviceCard; context: { $implicit: svc, profId: null }"></ng-container>
                    }
                  </div>
                </div>
              }
            }
          </div>
        }
      </div>
    }

    <!-- Service card template -->
    <ng-template #serviceCard let-svc let-profId="profId">
      <div class="service-card">
        <div class="service-card-top">
          <span class="service-dot" [style.background]="svc.color || '#94a3b8'"></span>
          <div class="service-card-info">
            <h3 class="service-name">{{ svc.name }}</h3>
            @if (svc.description) {
              <p class="service-desc">{{ svc.description | stripHtml }}</p>
            }
          </div>
          @if (svc.price != null) {
            <span class="service-price">{{ svc.price }}€</span>
          }
        </div>
        <div class="service-card-bottom">
          <div class="service-meta">
            <span class="duration-badge">{{ svc.duration_minutes }} min</span>
            <div class="prof-chips">
              @for (p of (svc.professionals ?? []).filter(p => !!p?.display_name).slice(0, 3); track p.id) {
                <div class="prof-chip"
                  [style.background]="p.avatar_url && !failedAvatarIds().has(p.id) ? 'transparent' : getAvatarColor(p.display_name).bg"
                  [style.color]="getAvatarColor(p.display_name).fg"
                  [title]="p.display_name">
                  @if (p.avatar_url && !failedAvatarIds().has(p.id)) {
                    <img [src]="p.avatar_url" [alt]="p.display_name" class="prof-chip-img" (error)="onAvatarError(p.id)" />
                  } @else {
                    {{ getInitials(p.display_name) }}
                  }
                </div>
              }
            </div>
          </div>
          <a
            class="btn btn-reservar"
            [routerLink]="['/', slug(), 'reservar', svc.id]"
            [queryParams]="profId ? { professional: profId } : {}"
          >Reservar</a>
        </div>
      </div>
    </ng-template>
  `,
  styles: [
    `
      :host { display: block; }

      .page-header-identity {
        @apply flex items-center gap-3 mb-1;
        h1 { @apply m-0; }
      }
      .company-logo {
        @apply w-12 h-12 rounded-lg object-contain bg-white/90 p-1 shadow-sm flex-shrink-0;
      }
      .company-logo-placeholder {
        @apply w-12 h-12 rounded-lg bg-white/25 flex items-center justify-center flex-shrink-0;
        svg { @apply w-6 h-6 text-primary opacity-70; }
      }

      /* ── Loading skeleton ── */
      .catalog-loading {
        @apply max-w-[1100px] mx-auto px-4 py-8;
      }
      .skeleton {
        background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
        @apply rounded-md;
      }
      @keyframes shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
      .skeleton-title { @apply h-8 w-48 mb-6; }
      .skeleton-tabs { @apply flex gap-2 mb-8; }
      .skeleton-tab { @apply h-10 w-32 rounded-full; }
      .skeleton-grid { @apply grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4; }
      .skeleton-card { @apply h-40 rounded-xl; }

      /* ── Error state ── */
      .error-state {
        @apply flex flex-col items-center justify-center min-h-[50vh] text-center p-8 gap-4;
      }
      .error-icon { @apply text-5xl opacity-50; }

      /* ── Main layout ── */
      .catalog-page {
        @apply max-w-[1100px] mx-auto px-6 pb-16;
      }

      .catalog-hero {
        @apply rounded-2xl p-8 pt-4 pb-0 mb-4;
        background: linear-gradient(135deg, #f1f5f9 0%, transparent 80%);
        html.dark & {
          background: linear-gradient(135deg, #1e293b 0%, transparent 80%);
        }
      }

      .page-header {
        @apply mb-6 pt-4;
        h1 { @apply text-2xl font-bold text-slate-800 m-0 mb-1; }
      }
      .page-subtitle { @apply text-sm text-secondary m-0; }

      /* ── Journey tabs ── */
      .journey-tabs {
        @apply flex gap-1 overflow-x-auto;
      }
      .journey-tab {
        @apply flex items-center gap-2 px-5 py-2 rounded-lg border border-transparent bg-transparent text-sm font-medium text-secondary cursor-pointer whitespace-nowrap transition-all duration-150;
        &:hover { @apply text-slate-800 bg-white/50; }
        &.active { @apply bg-primary border-primary text-white shadow-sm; }
      }
      .tab-icon { @apply w-4 h-4 flex-shrink-0; }

      /* ── Sort row ── */
      .sort-row {
        @apply flex items-center justify-between mb-4;
      }
      .count-label { @apply text-sm text-secondary; }
      .sort-select {
        @apply text-sm border border-slate-200 rounded-md px-3 py-1 bg-white text-slate-800 cursor-pointer;
      }

      /* ── Services grid ── */
      .services-grid {
        @apply grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4;
      }

      /* ── Service card ── */
.service-card {
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        @apply rounded-xl p-5 flex flex-col gap-4 transition-all duration-150;
        &:hover {
          border-color: var(--color-primary);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
        }
      }
      .service-card-top { @apply flex items-start gap-3; }
      .service-dot { @apply w-3 h-3 rounded-full flex-shrink-0 mt-1; }
      .service-card-info { @apply flex-1 min-w-0; }
      .service-name { @apply text-base font-semibold m-0 mb-1 leading-tight; color: var(--color-text); }
      .service-desc { @apply text-xs m-0 overflow-hidden line-clamp-2; color: var(--color-text-secondary); }
      .service-price { @apply text-xl font-bold flex-shrink-0 whitespace-nowrap; color: var(--color-text-secondary); }
      .service-card-bottom {
        @apply flex items-center justify-between border-t pt-4;
        border-color: var(--color-border);
      }
      .service-meta { @apply flex items-center gap-2; }
      .duration-badge {
        @apply text-xs font-medium px-2 py-0.5 rounded-full;
        background: var(--color-surface-hover);
        border: 1px solid var(--color-border);
        color: var(--color-text-secondary);
      }
      .prof-chips { @apply flex gap-1; }
      .prof-chip {
        @apply inline-flex items-center justify-center w-6 h-6 rounded-full overflow-hidden text-[0.6rem] font-bold flex-shrink-0;
      }
      .prof-chip-img { @apply w-full h-full object-cover block; }
      .btn-reservar {
        @apply text-sm font-semibold px-4 py-2 rounded-lg no-underline whitespace-nowrap transition-colors duration-150;
        background: var(--color-primary);
        color: var(--color-primary-text);
        &:hover { background: var(--color-primary-hover); }
      }

      /* ── Professionals grid ── */
      .professionals-grid {
        @apply grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4 mt-4;
      }
      .prof-card {
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        @apply rounded-xl p-4 cursor-pointer text-center transition-all duration-150;
        &:hover { border-color: var(--color-primary); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
      }
      .prof-card-avatar-wrap {
        @apply aspect-square rounded-lg overflow-hidden mb-3 flex items-center justify-center;
        background: var(--color-surface-hover);
      }
      .prof-card-avatar-img { @apply w-full h-full object-cover; }
      .prof-card-avatar-initials {
        @apply w-full h-full flex items-center justify-center text-2xl font-bold;
      }
      .prof-card-info { @apply text-center; }
      .prof-card-name {
        @apply font-bold text-sm m-0 mb-1;
        color: var(--color-text);
      }
      .prof-card-tags { @apply flex flex-wrap justify-center gap-1; }
      .prof-tag {
        @apply text-[0.6rem] font-bold uppercase tracking-wide px-2 py-0.5 rounded-sm;
        background: var(--color-surface-hover);
        border: 1px solid var(--color-border);
        color: var(--color-text-secondary);
      }

      /* ── Professional detail ── */
      .back-btn {
        @apply inline-flex items-center gap-2 text-sm bg-transparent border-none cursor-pointer p-0 mb-6 transition-colors duration-150;
        color: var(--color-text-secondary);
        &:hover { color: var(--color-text); }
      }
      .prof-detail-header {
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        @apply flex items-center gap-5 p-5 rounded-xl mb-8;
      }
      .prof-detail-avatar {
        @apply w-16 h-16 rounded-full object-cover flex-shrink-0;
      }
      .prof-detail-avatar-placeholder {
        @apply w-16 h-16 rounded-full flex-shrink-0 flex items-center justify-center text-xl font-bold;
      }
      .prof-detail-name {
        @apply text-xl font-bold m-0 mb-1;
        color: var(--color-text);
      }
      .prof-detail-cta {
        @apply text-xs font-medium m-1;
        color: var(--color-primary);
      }
      .section-label {
        @apply text-xs font-semibold uppercase tracking-wide m-0 mb-4;
        color: var(--color-text-disabled);
      }

      /* ── Duration view ── */
      .duration-group { @apply mb-10; }
      .duration-group-header { @apply flex items-center gap-3 mb-4; }
      .duration-group-icon {
        @apply w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0;
      }
      .duration-group-title { @apply text-base font-semibold m-0; color: var(--color-text); }
      .duration-group-desc { @apply text-xs m-0; color: var(--color-text-disabled); }
      .duration-group-count { @apply text-sm m-0 ml-auto; color: var(--color-text-secondary); }
      .ml-auto { margin-left: auto; }

      /* ── Shared btn ── */
      .btn {
        @apply inline-flex items-center gap-2 px-4 py-2 border-none rounded-md text-sm font-medium cursor-pointer no-underline transition-all duration-150;
      }
      .btn-primary { background: var(--color-primary); color: var(--color-primary-text); &:hover { background: var(--color-primary-hover); } }
    `,
  ],
})
export class CatalogComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private bookingService = inject(BookingPublicService);

  slug = signal<string>("");
  company = signal<Company | null>(null);
  services = signal<Service[]>([]);
  professionals = signal<Professional[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  activeTab = signal<Journey>("services");
  sortOrder = signal<SortOrder>("default");
  sortOrderValue: SortOrder = "default";
  selectedProfessional = signal<Professional | null>(null);
  failedAvatarIds = signal<Set<string>>(new Set());
  private deepLinkProfessionalId: string | null = null;
  private deepLinkProfessionalSlug: string | null = null;

  readonly durationGroups: DurationGroup[] = [
    { label: "Sesiones rápidas",  desc: "30 min o menos",  icon: "⚡", min: 0,  max: 30,       color: "#10B981" },
    { label: "Sesiones estándar", desc: "31 a 60 min",     icon: "⏱", min: 31, max: 60,       color: "#3B82F6" },
    { label: "Sesiones largas",   desc: "Más de 60 min",   icon: "✨", min: 61, max: Infinity, color: "#8B5CF6" },
  ];

  sortedServices = computed(() => {
    const list = [...this.services()];
    switch (this.sortOrder()) {
      case "price-asc":    return list.sort((a, b) => (a.price ?? 9999) - (b.price ?? 9999));
      case "price-desc":   return list.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
      case "duration-asc": return list.sort((a, b) => a.duration_minutes - b.duration_minutes);
      case "name":         return list.sort((a, b) => a.name.localeCompare(b.name, "es"));
      default:             return list;
    }
  });

  getGroupServices(group: DurationGroup): Service[] {
    return this.services().filter(
      (s) => s.duration_minutes >= group.min && s.duration_minutes <= group.max,
    );
  }

  onAvatarError(id: string): void {
    this.failedAvatarIds.update(s => new Set([...s, id]));
  }

  getInitials(name: string): string {
    if (!name) return '';
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  getAvatarColor(name: string): { bg: string; fg: string } {
    const palette = [
      { bg: "#dbeafe", fg: "#1d4ed8" },
      { bg: "#dcfce7", fg: "#15803d" },
      { bg: "#fce7f3", fg: "#9d174d" },
      { bg: "#fef3c7", fg: "#b45309" },
      { bg: "#ede9fe", fg: "#6d28d9" },
    ];
    if (!name) return palette[0];
    const idx = (name.charCodeAt(0) || 0) % palette.length;
    return palette[idx];
  }

  setTab(tab: Journey) {
    this.activeTab.set(tab);
    this.selectedProfessional.set(null);
  }

  showProfessionalDetail(prof: Professional) {
    this.selectedProfessional.set(prof);
  }

  backToProfList() {
    this.selectedProfessional.set(null);
  }

  reload() {
    const slug = this.slug();
    if (slug) this.loadData(slug);
  }

  ngOnInit() {
    // Capture professional deep-link query params (slug or UUID) before data load
    this.deepLinkProfessionalSlug =
      this.route.snapshot.queryParamMap.get("professional") ??
      this.route.parent?.snapshot.queryParamMap.get("professional") ??
      null;
    this.deepLinkProfessionalId =
      this.route.snapshot.queryParamMap.get("professional_id") ??
      this.route.parent?.snapshot.queryParamMap.get("professional_id") ??
      null;

    // Try parent route first (nested under /:slug)
    const parentParams = this.route.parent?.snapshot.paramMap;
    const slugFromParent = parentParams?.get("slug");
    if (slugFromParent) {
      this.slug.set(slugFromParent);
      this.loadData(slugFromParent);
      return;
    }
    // Fallback: own params
    this.route.paramMap.subscribe((params) => {
      const s = params.get("slug");
      if (s) {
        this.slug.set(s);
        this.loadData(s);
      }
    });
  }

  private loadData(slug: string) {
    this.loading.set(true);
    this.error.set(null);
    this.bookingService.getServices(slug).subscribe({
      next: (res) => {
        this.company.set(res.company);
        applyBrandingColors(res.company?.primary_color, res.company?.secondary_color);
        this.services.set(res.services);

        // Build professionals enriched with their services.
        // The top-level professionals list may be empty (older deployed function),
        // so we also extract professionals from the professional_services join
        // embedded within each service and merge both sources.
        const topLevel = res.professionals ?? [];
        const profMap = new Map<string, Professional>();
        for (const svc of (res.services ?? [])) {
          for (const p of (svc.professionals ?? []).filter((p: Professional) => p?.id && p?.display_name)) {
            if (!profMap.has(p.id)) {
              const full = topLevel.find((fp) => fp.id === p.id);
              profMap.set(p.id, { ...(full ?? p), services: [] });
            }
            profMap.get(p.id)!.services!.push(svc);
          }
        }
        // Prefer the enriched set; fall back to the raw top-level list when
        // no service has professionals attached.
        const professionals = profMap.size > 0
          ? Array.from(profMap.values())
          : topLevel;
        this.professionals.set(professionals);

        // Deep-link: if a professional slug or id was in the URL, auto-select them
        // Slug takes precedence (new format), then UUID fallback
        if (this.deepLinkProfessionalSlug) {
          const target = professionals.find(p => p.slug === this.deepLinkProfessionalSlug);
          if (target) {
            this.activeTab.set('professionals');
            this.selectedProfessional.set(target);
          }
          this.deepLinkProfessionalSlug = null;
          this.deepLinkProfessionalId = null;
        } else if (this.deepLinkProfessionalId) {
          const target = professionals.find(p => p.id === this.deepLinkProfessionalId);
          if (target) {
            this.activeTab.set('professionals');
            this.selectedProfessional.set(target);
          }
          this.deepLinkProfessionalId = null;
        }

        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || "Error al cargar los servicios");
        this.loading.set(false);
      },
    });
  }
}
