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
  imports: [RouterLink, TranslocoModule, CommonModule, FormsModule],
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
      <header class="header-bar">
        <div class="header-inner">
          <div class="header-logo-placeholder">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
          </div>
          <span class="header-company-name">{{ company()?.name }}</span>
        </div>
      </header>
      <div class="catalog-page">
        <header class="page-header">
          <h1>{{ company()?.name }}</h1>
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
                  <p class="prof-detail-meta">
                    {{ (selectedProfessional()!.services?.length ?? 0) }} servicio{{ (selectedProfessional()!.services?.length ?? 0) !== 1 ? 's disponibles' : ' disponible' }}
                  </p>
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
                      <p class="prof-card-count">{{ (prof.services?.length ?? 0) }} servicio{{ (prof.services?.length ?? 0) !== 1 ? 's' : '' }}</p>
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
              <p class="service-desc">{{ svc.description }}</p>
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
      :host {
        display: block;
      }

      /* ── Branded header bar ── */
      .header-bar {
        background: var(--color-primary);
        position: sticky;
        top: 0;
        z-index: 30;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
      }
      .header-inner {
        max-width: 1100px;
        margin: 0 auto;
        padding: 0.75rem 1rem;
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }
      .header-logo-placeholder {
        width: 2.25rem;
        height: 2.25rem;
        border-radius: 0.5rem;
        background: rgba(255, 255, 255, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        svg {
          width: 1.25rem;
          height: 1.25rem;
          color: white;
          opacity: 0.85;
        }
      }
      .header-company-name {
        font-size: var(--font-size-base);
        font-weight: var(--font-weight-semibold);
        color: white;
        flex: 1;
      }

      /* ── Loading skeleton ── */
      .catalog-loading {
        max-width: 1100px;
        margin: 0 auto;
        padding: var(--space-8) var(--space-4);
      }
      .skeleton {
        background: linear-gradient(90deg, var(--skeleton-from, #e2e8f0) 25%, var(--skeleton-to, #f1f5f9) 50%, var(--skeleton-from, #e2e8f0) 75%);
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
        border-radius: var(--radius-md);
      }
      @keyframes shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
      .skeleton-title { height: 2rem; width: 12rem; margin-bottom: 1.5rem; }
      .skeleton-tabs { display: flex; gap: var(--space-2); margin-bottom: 2rem; }
      .skeleton-tab { height: 2.5rem; width: 8rem; border-radius: var(--radius-full); }
      .skeleton-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: var(--space-4); }
      .skeleton-card { height: 10rem; border-radius: var(--radius-lg); }

      /* ── Error state ── */
      .error-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 50vh;
        text-align: center;
        padding: var(--space-8);
        gap: var(--space-4);
      }
      .error-icon {
        font-size: 3rem;
        opacity: 0.5;
      }

      /* ── Main layout ── */
      .catalog-page {
        max-width: 1100px;
        margin: 0 auto;
        padding: var(--space-8) var(--space-4) var(--space-16);
      }

      .page-header {
        margin-bottom: var(--space-6);
        h1 { font-size: var(--font-size-2xl); font-weight: var(--font-weight-bold); color: var(--color-text-primary); margin: 0 0 var(--space-1); }
      }
      .page-subtitle { color: var(--color-text-secondary); font-size: var(--font-size-sm); margin: 0; }

      /* ── Journey tabs ── */
      .journey-tabs {
        display: flex;
        gap: var(--space-1);
        background: var(--color-surface);
        border-radius: var(--radius-xl);
        padding: var(--space-1);
        margin-bottom: var(--space-8);
        overflow-x: auto;
      }
      .journey-tab {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        padding: var(--space-2) var(--space-5);
        border-radius: var(--radius-lg);
        border: none;
        background: transparent;
        color: var(--color-text-secondary);
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);
        cursor: pointer;
        white-space: nowrap;
        transition: all var(--transition-fast);
        &:hover { color: var(--color-text-primary); }
        &.active {
          background: var(--color-primary);
          color: white;
          box-shadow: var(--shadow-sm);
        }
      }
      .tab-icon { width: 1rem; height: 1rem; flex-shrink: 0; }

      /* ── Sort row ── */
      .sort-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: var(--space-4);
      }
      .count-label {
        font-size: var(--font-size-sm);
        color: var(--color-text-secondary);
      }
      .sort-select {
        font-size: var(--font-size-sm);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        padding: var(--space-1) var(--space-3);
        background: var(--color-background);
        color: var(--color-text-primary);
        cursor: pointer;
      }

      /* ── Services grid ── */
      .services-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        gap: var(--space-4);
      }

      /* ── Service card ── */
      .service-card {
        background: var(--color-background);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-xl);
        padding: var(--space-5);
        display: flex;
        flex-direction: column;
        gap: var(--space-4);
        transition: all var(--transition-fast);
        &:hover {
          border-color: var(--color-primary);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
      }
      .service-card-top {
        display: flex;
        align-items: flex-start;
        gap: var(--space-3);
      }
      .service-dot {
        width: 0.75rem;
        height: 0.75rem;
        border-radius: 50%;
        flex-shrink: 0;
        margin-top: 0.25rem;
      }
      .service-card-info { flex: 1; min-width: 0; }
      .service-name {
        font-size: var(--font-size-base);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text-primary);
        margin: 0 0 var(--space-1);
        line-height: 1.3;
      }
      .service-desc {
        font-size: var(--font-size-xs);
        color: var(--color-text-secondary);
        margin: 0;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }
      .service-price {
        font-size: var(--font-size-xl);
        font-weight: var(--font-weight-bold);
        color: var(--color-primary);
        flex-shrink: 0;
        white-space: nowrap;
      }
      .service-card-bottom {
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-top: 1px solid var(--color-border);
        padding-top: var(--space-4);
      }
      .service-meta { display: flex; align-items: center; gap: var(--space-2); }
      .duration-badge {
        font-size: var(--font-size-xs);
        font-weight: var(--font-weight-medium);
        padding: var(--space-1) var(--space-2);
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-full);
        color: var(--color-text-secondary);
      }
      .prof-chips { display: flex; gap: var(--space-1); }
      .prof-chip {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 1.5rem;
        height: 1.5rem;
        border-radius: 50%;
        overflow: hidden;
        font-size: 0.6rem;
        font-weight: var(--font-weight-bold);
        flex-shrink: 0;
      }
      .prof-chip-img { width: 100%; height: 100%; object-fit: cover; display: block; }
      .btn-reservar {
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-semibold);
        padding: var(--space-2) var(--space-4);
        background: var(--color-primary);
        color: white;
        border-radius: var(--radius-lg);
        text-decoration: none;
        transition: background var(--transition-fast);
        white-space: nowrap;
        &:hover { background: var(--color-primary-hover); }
      }

      /* ── Professionals grid ── */
      .professionals-view { }
      .professionals-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: var(--space-4);
        margin-top: var(--space-4);
      }
      .prof-card {
        background: var(--color-background);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-xl);
        padding: var(--space-4);
        cursor: pointer;
        text-align: center;
        transition: all var(--transition-fast);
        &:hover {
          border-color: var(--color-primary);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
      }
      .prof-card-avatar-wrap {
        aspect-ratio: 1;
        border-radius: var(--radius-lg);
        overflow: hidden;
        background: var(--color-surface);
        margin-bottom: var(--space-3);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .prof-card-avatar-img { width: 100%; height: 100%; object-fit: cover; }
      .prof-card-avatar-initials {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--font-size-2xl);
        font-weight: var(--font-weight-bold);
      }
      .prof-card-info { text-align: center; }
      .prof-card-name {
        font-weight: var(--font-weight-bold);
        color: var(--color-text-primary);
        font-size: var(--font-size-sm);
        margin: 0 0 var(--space-1);
      }
      .prof-card-count {
        font-size: var(--font-size-xs);
        color: var(--color-text-muted);
        margin: 0 0 var(--space-2);
      }
      .prof-card-tags { display: flex; flex-wrap: wrap; justify-content: center; gap: var(--space-1); }
      .prof-tag {
        font-size: 0.6rem;
        font-weight: var(--font-weight-bold);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        padding: 2px var(--space-2);
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-sm);
        color: var(--color-text-secondary);
      }

      /* ── Professional detail ── */
      .view-prof-detail { }
      .back-btn {
        display: inline-flex;
        align-items: center;
        gap: var(--space-2);
        font-size: var(--font-size-sm);
        color: var(--color-text-secondary);
        background: none;
        border: none;
        cursor: pointer;
        padding: 0;
        margin-bottom: var(--space-6);
        transition: color var(--transition-fast);
        &:hover { color: var(--color-text-primary); }
      }
      .prof-detail-header {
        display: flex;
        align-items: center;
        gap: var(--space-5);
        padding: var(--space-5);
        background: var(--color-background);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-xl);
        margin-bottom: var(--space-8);
        box-shadow: var(--shadow-sm);
      }
      .prof-detail-avatar {
        width: 4rem;
        height: 4rem;
        border-radius: 50%;
        object-fit: cover;
        flex-shrink: 0;
      }
      .prof-detail-avatar-placeholder {
        width: 4rem;
        height: 4rem;
        border-radius: 50%;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--font-size-xl);
        font-weight: var(--font-weight-bold);
      }
      .prof-detail-name {
        font-size: var(--font-size-xl);
        font-weight: var(--font-weight-bold);
        color: var(--color-text-primary);
        margin: 0 0 var(--space-1);
      }
      .prof-detail-meta {
        font-size: var(--font-size-sm);
        color: var(--color-text-muted);
        margin: 0;
      }
      .prof-detail-cta {
        font-size: var(--font-size-xs);
        font-weight: var(--font-weight-medium);
        color: var(--color-primary);
        margin: var(--space-1) 0 0;
      }
      .section-label {
        font-size: var(--font-size-xs);
        font-weight: var(--font-weight-semibold);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--color-text-muted);
        margin: 0 0 var(--space-4);
      }

      /* ── Duration view ── */
      .view-duration { }
      .duration-group { margin-bottom: var(--space-10); }
      .duration-group-header {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        margin-bottom: var(--space-4);
      }
      .duration-group-icon {
        width: 2.25rem;
        height: 2.25rem;
        border-radius: var(--radius-lg);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.1rem;
        flex-shrink: 0;
      }
      .duration-group-title {
        font-size: var(--font-size-base);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text-primary);
        margin: 0;
      }
      .duration-group-desc {
        font-size: var(--font-size-xs);
        color: var(--color-text-muted);
        margin: 0;
      }
      .duration-group-count {
        font-size: var(--font-size-sm);
        color: var(--color-text-muted);
        margin-left: auto;
      }
      .ml-auto { margin-left: auto; }

      /* ── Shared btn ── */
      .btn {
        display: inline-flex;
        align-items: center;
        gap: var(--space-2);
        padding: var(--space-2) var(--space-4);
        border: none;
        border-radius: var(--radius-md);
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);
        cursor: pointer;
        text-decoration: none;
        transition: all var(--transition-fast);
      }
      .btn-primary {
        background: var(--color-primary);
        color: white;
        &:hover { background: var(--color-primary-hover); }
      }
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
    // Apply system color-scheme preference and react to changes
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    document.documentElement.classList.toggle("dark", mq?.matches ?? false);
    mq?.addEventListener("change", (e) => {
      document.documentElement.classList.toggle("dark", e.matches);
    });

    // Capture professional_id deep-link query param before data load
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

        // Deep-link: if a professional_id was in the URL, auto-select them
        if (this.deepLinkProfessionalId) {
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
