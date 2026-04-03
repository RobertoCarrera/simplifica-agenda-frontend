import { Component, OnInit, signal, computed, inject } from "@angular/core";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { TranslocoModule } from "@jsverse/transloco";
import { CommonModule } from "@angular/common";
import {
  BookingPublicService,
  Service,
  Professional,
  BusyPeriod,
} from "../../services/booking-public.service";
import { AvailabilityService } from "../../services/availability.service";
import { TurnstileService } from "../../services/turnstile.service";
import { WeeklyCalendarComponent } from "../calendar/weekly-calendar.component";
import { TimeSlot } from "../calendar/time-slot.component";
import { applyBrandingColors } from "../../shared/branding.utils";

@Component({
  selector: "app-booking-wizard",
  standalone: true,
  imports: [FormsModule, TranslocoModule, CommonModule, RouterLink, WeeklyCalendarComponent],
  template: `
    <div class="wizard-page">
      <!-- Back link -->
      <a [routerLink]="['/', slug(), 'servicios']" class="back-link">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width:1rem;height:1rem">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
        Volver a servicios
      </a>

      @if (loadingService()) {
        <div class="service-summary-skeleton skeleton"></div>
      } @else if (service()) {
        <!-- Service summary bar -->
        <div class="service-summary">
          <span class="service-dot" [style.background]="service()!.color || '#94a3b8'"></span>
          <div class="service-summary-info">
            <strong>{{ service()!.name }}</strong>
            <span class="service-summary-meta">{{ service()!.duration_minutes }} min</span>
            @if (service()!.price != null) {
              <span class="service-summary-price">{{ service()!.price }}€</span>
            }
          </div>
        </div>
      }

      @if (step() === 4) {
        <!-- ── SUCCESS ────────────────────────────────── -->
        <div class="success-card">
          <div class="success-icon">✓</div>
          <h2 class="success-title">¡Reserva confirmada!</h2>
          @if (bookingId()) {
            <p class="success-id">Ref: {{ bookingId() }}</p>
          }
          @if (selectedSlot()) {
            <p class="success-detail">
              {{ service()?.name }} · {{ formatSlotDate(selectedSlot()!) }}
            </p>
          }
          <a [routerLink]="['/', slug(), 'servicios']" class="btn btn-primary">
            Volver al inicio
          </a>
        </div>
      } @else {
        <!-- ── PROGRESS BAR ────────────────────────────── -->
        <div class="progress-bar">
          @for (n of [1,2,3]; track n) {
            <div class="progress-step" [class.active]="step() >= n" [class.done]="step() > n">
              <div class="ps-circle">{{ step() > n ? '✓' : n }}</div>
              <span class="ps-label">
                @switch (n) {
                  @case (1) { Tus datos }
                  @case (2) { Cuándo }
                  @case (3) { Confirmar }
                }
              </span>
            </div>
            @if (n < 3) { <div class="progress-line" [class.done]="step() > n"></div> }
          }
        </div>

        <!-- ── STEP 1: Client info + pro select ────────── -->
        @if (step() === 1) {
          <div class="step-card">
            <h2 class="step-title">Tus datos de contacto</h2>

            @if (professionals().length > 0) {
              <div class="form-group">
                <label>Profesional</label>
                <div class="prof-selector">
                  <!-- Sin preferencia -->
                  <button type="button"
                    class="prof-option"
                    [class.prof-option--selected]="formProfessionalId === ''"
                    (click)="formProfessionalId = ''">
                    <div class="prof-option-avatar prof-option-avatar--any">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                    </div>
                    <div class="prof-option-info">
                      <span class="prof-option-name">Sin preferencia</span>
                      <span class="prof-option-title">Cualquier profesional</span>
                    </div>
                    @if (formProfessionalId === '') {
                      <svg class="prof-option-check" viewBox="0 0 24 24" fill="currentColor">
                        <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd"/>
                      </svg>
                    }
                  </button>
                  <!-- Profesionales -->
                  @for (p of professionals(); track p.id) {
                    <button type="button"
                      class="prof-option"
                      [class.prof-option--selected]="formProfessionalId === p.id"
                      (click)="formProfessionalId = p.id">
                      @if (p.avatar_url && !failedAvatarIds().has(p.id)) {
                        <img class="prof-option-avatar" [src]="p.avatar_url" [alt]="p.display_name" (error)="onAvatarError(p.id)" />
                      } @else {
                        <div class="prof-option-avatar prof-option-avatar--initials"
                          [style.background]="getAvatarColor(p.display_name).bg"
                          [style.color]="getAvatarColor(p.display_name).fg">
                          {{ getInitials(p.display_name) }}
                        </div>
                      }
                      <div class="prof-option-info">
                        <span class="prof-option-name">{{ p.display_name }}</span>
                        @if (p.title) {
                          <span class="prof-option-title">{{ p.title }}</span>
                        }
                      </div>
                      @if (formProfessionalId === p.id) {
                        <svg class="prof-option-check" viewBox="0 0 24 24" fill="currentColor">
                          <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd"/>
                        </svg>
                      }
                    </button>
                  }
                </div>
              </div>
            }

            <div class="form-group">
              <label for="clientName">Nombre *</label>
              <input id="clientName" type="text" class="form-control"
                [(ngModel)]="formName" placeholder="Tu nombre completo"
                [class.invalid]="errors()['name']" />
              @if (errors()['name']) {
                <span class="error-msg">{{ errors()['name'] }}</span>
              }
            </div>

            <div class="form-group">
              <label for="clientPhone">Teléfono *</label>
              <input id="clientPhone" type="tel" class="form-control"
                [(ngModel)]="formPhone" placeholder="Tu número de teléfono"
                [class.invalid]="errors()['phone']" />
              @if (errors()['phone']) {
                <span class="error-msg">{{ errors()['phone'] }}</span>
              }
            </div>

            <div class="form-group">
              <label for="clientEmail">Email *</label>
              <input id="clientEmail" type="email" class="form-control"
                [(ngModel)]="formEmail" placeholder="tu@correo.com"
                [class.invalid]="errors()['email']" />
              @if (errors()['email']) {
                <span class="error-msg">{{ errors()['email'] }}</span>
              }
            </div>

            <div class="step-actions">
              <button class="btn btn-primary btn-full" (click)="goStep2()">
                Continuar
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width:1rem;height:1rem">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </div>
        }

        <!-- ── STEP 2: Method selection ─────────────────── -->
        @if (step() === 2) {
          <div class="step-card">
            <h2 class="step-title">¿Cuándo quieres tu cita?</h2>

            @if (autoSearching()) {
              <div class="auto-searching">
                <div class="spinner"></div>
                <p>Buscando la primera disponibilidad...</p>
              </div>
            } @else if (autoError()) {
              <div class="auto-error">
                <p>{{ autoError() }}</p>
                <button class="btn btn-outline" (click)="clearAutoError()">Intentar de nuevo</button>
              </div>
            } @else {
              <div class="method-cards">
                <button class="method-card" (click)="selectMethodAuto()">
                  <div class="method-icon">⚡</div>
                  <div class="method-info">
                    <strong>Primera disponible</strong>
                    <p>Te buscamos el primer hueco libre</p>
                  </div>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width:1.25rem;height:1.25rem;opacity:0.4">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
                <button class="method-card" (click)="selectMethodManual()">
                  <div class="method-icon">📅</div>
                  <div class="method-info">
                    <strong>Elegir día y hora</strong>
                    <p>Selecciona tú mismo cuándo quieres venir</p>
                  </div>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width:1.25rem;height:1.25rem;opacity:0.4">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
            }

            <div class="step-actions step-actions-back">
              <button class="btn btn-ghost" (click)="step.set(1)">← Atrás</button>
            </div>
          </div>
        }

        <!-- ── STEP 3: Calendar ───────────────────────── -->
        @if (step() === 3) {
          <div class="step-card step-card-wide">
            <h2 class="step-title">Selecciona tu horario</h2>

            @if (loadingAvailability()) {
              <div class="availability-loading">
                <div class="spinner"></div>
                <p>Cargando disponibilidad...</p>
              </div>
            } @else {
              <app-weekly-calendar
                [busyPeriods]="busyPeriods()"
                [serviceDuration]="service()?.duration_minutes ?? 30"
                [initialDate]="calendarInitialDate()"
                (slotSelected)="onSlotSelected($event)"
                (weekChanged)="onWeekChanged($event)"
              />
            }

            <div id="cf-turnstile"></div>

            <div class="step-actions">
              <button class="btn btn-ghost" (click)="step.set(2)">← Atrás</button>
              <button
                class="btn btn-primary"
                [disabled]="!selectedSlot() || submitting()"
                (click)="confirmBooking()"
              >
                @if (submitting()) {
                  <div class="spinner spinner-sm"></div>
                  Enviando...
                } @else if (selectedSlot()) {
                  Reservar {{ formatSlotDate(selectedSlot()!) }}
                } @else {
                  Selecciona una hora
                }
              </button>
            </div>

            @if (submitError()) {
              <div class="submit-error">{{ submitError() }}</div>
            }
          </div>
        }
      }
    </div>
  `,
  styles: [
    `
      :host { display: block; }

      .wizard-page {
        max-width: 680px;
        margin: 0 auto;
        padding: var(--space-6) var(--space-4) var(--space-16);
      }

      /* ── Back link ── */
      .back-link {
        display: inline-flex;
        align-items: center;
        gap: var(--space-2);
        font-size: var(--font-size-sm);
        color: var(--color-text-secondary);
        text-decoration: none;
        margin-bottom: var(--space-6);
        transition: color var(--transition-fast);
        &:hover { color: var(--color-text-primary); }
      }

      /* ── Service summary ── */
      .service-summary-skeleton {
        height: 3.5rem;
        border-radius: var(--radius-xl);
        margin-bottom: var(--space-6);
        background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
      }
      @keyframes shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
      .service-summary {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        background: var(--color-background);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-xl);
        padding: var(--space-3) var(--space-4);
        margin-bottom: var(--space-6);
        box-shadow: var(--shadow-sm);
      }
      .service-dot {
        width: 0.625rem;
        height: 0.625rem;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .service-summary-info {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        flex-wrap: wrap;
        strong { color: var(--color-text-primary); font-size: var(--font-size-sm); }
      }
      .service-summary-meta {
        font-size: var(--font-size-xs);
        color: var(--color-text-muted);
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-full);
        padding: 2px var(--space-2);
      }
      .service-summary-price {
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-bold);
        color: var(--color-primary);
      }

      /* ── Progress bar ── */
      .progress-bar {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0;
        margin-bottom: var(--space-8);
      }
      .progress-step {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-1);
        .ps-circle {
          width: 2rem;
          height: 2rem;
          border-radius: 50%;
          background: var(--color-surface);
          border: 2px solid var(--color-border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-muted);
          transition: all var(--transition-fast);
        }
        .ps-label {
          font-size: 0.65rem;
          color: var(--color-text-muted);
          white-space: nowrap;
        }
        &.active .ps-circle {
          background: var(--color-primary);
          border-color: var(--color-primary);
          color: white;
        }
        &.active .ps-label { color: var(--color-primary); font-weight: var(--font-weight-medium); }
        &.done .ps-circle {
          background: #10B981;
          border-color: #10B981;
          color: white;
        }
      }
      .progress-line {
        width: 2rem;
        height: 2px;
        background: var(--color-border);
        margin-bottom: 1.2rem;
        flex-shrink: 0;
        transition: background var(--transition-fast);
        &.done { background: #10B981; }
      }

      /* ── Step card ── */
      .step-card {
        background: var(--color-background);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-xl);
        padding: var(--space-6);
        box-shadow: var(--shadow-sm);
      }
      .step-card-wide {
        max-width: 100%;
        width: 100%;
      }
      .step-title {
        font-size: var(--font-size-xl);
        font-weight: var(--font-weight-bold);
        color: var(--color-text-primary);
        margin: 0 0 var(--space-6);
      }

      /* ── Form ── */
      .form-group {
        margin-bottom: var(--space-4);
        label {
          display: block;
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium);
          color: var(--color-text-secondary);
          margin-bottom: var(--space-1);
        }
      }
      .form-control {
        display: block;
        width: 100%;
        padding: var(--space-2) var(--space-3);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        font-size: var(--font-size-sm);
        background: var(--color-background);
        color: var(--color-text-primary);
        transition: border-color var(--transition-fast);
        box-sizing: border-box;
        &:focus { outline: none; border-color: var(--color-primary); }
        &.invalid { border-color: var(--color-error); }
      }
      .error-msg {
        font-size: var(--font-size-xs);
        color: var(--color-error);
        margin-top: var(--space-1);
        display: block;
      }

      /* ── Step actions ── */
      .step-actions {
        display: flex;
        justify-content: flex-end;
        gap: var(--space-3);
        margin-top: var(--space-6);
        border-top: 1px solid var(--color-border);
        padding-top: var(--space-4);
      }
      .step-actions-back { justify-content: flex-start; }

      /* ── Method cards ── */
      .method-cards {
        display: grid;
        gap: var(--space-3);
      }
      .method-card {
        display: flex;
        align-items: center;
        gap: var(--space-4);
        padding: var(--space-4) var(--space-5);
        border: 1.5px solid var(--color-border);
        border-radius: var(--radius-xl);
        background: var(--color-background);
        cursor: pointer;
        text-align: left;
        width: 100%;
        transition: all var(--transition-fast);
        &:hover {
          border-color: var(--color-primary);
          box-shadow: var(--shadow-sm);
        }
      }
      .method-icon {
        font-size: 1.5rem;
        flex-shrink: 0;
      }
      .method-info {
        flex: 1;
        min-width: 0;
        strong { display: block; font-size: var(--font-size-sm); color: var(--color-text-primary); margin-bottom: var(--space-1); }
        p { font-size: var(--font-size-xs); color: var(--color-text-muted); margin: 0; }
      }

      /* ── Auto searching ── */
      .auto-searching, .availability-loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-4);
        padding: var(--space-10) 0;
        color: var(--color-text-secondary);
        font-size: var(--font-size-sm);
      }
      .auto-error {
        padding: var(--space-4);
        border: 1px solid var(--color-error);
        border-radius: var(--radius-md);
        color: var(--color-error);
        font-size: var(--font-size-sm);
        text-align: center;
        margin-bottom: var(--space-4);
        p { margin: 0 0 var(--space-3); }
      }

      /* ── Submit error ── */
      .submit-error {
        margin-top: var(--space-3);
        padding: var(--space-3) var(--space-4);
        background: #fef2f2;
        border: 1px solid #fecaca;
        border-radius: var(--radius-md);
        font-size: var(--font-size-sm);
        color: var(--color-error);
        text-align: center;
      }

      /* ── Success ── */
      .success-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-3);
        padding: var(--space-12) var(--space-6);
        background: var(--color-background);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-xl);
        text-align: center;
      }
      .success-icon {
        width: 4rem;
        height: 4rem;
        border-radius: 50%;
        background: #d1fae5;
        color: #059669;
        font-size: 1.75rem;
        font-weight: bold;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .success-title {
        font-size: var(--font-size-2xl);
        font-weight: var(--font-weight-bold);
        color: var(--color-text-primary);
        margin: 0;
      }
      .success-id {
        font-size: var(--font-size-sm);
        color: var(--color-text-muted);
        margin: 0;
      }
      .success-detail {
        font-size: var(--font-size-base);
        color: var(--color-text-secondary);
        margin: 0;
      }

      /* ── Spinner ── */
      .spinner {
        width: 2rem;
        height: 2rem;
        border: 3px solid var(--color-border);
        border-top-color: var(--color-primary);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }
      .spinner-sm {
        width: 1rem;
        height: 1rem;
        border-width: 2px;
      }
      @keyframes spin { to { transform: rotate(360deg); } }

      /* ── Buttons ── */
      .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: var(--space-2);
        padding: var(--space-2) var(--space-5);
        border: none;
        border-radius: var(--radius-lg);
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-semibold);
        cursor: pointer;
        text-decoration: none;
        transition: all var(--transition-fast);
        &:disabled { opacity: 0.5; cursor: not-allowed; }
      }
      .btn-primary {
        background: var(--color-primary);
        color: white;
        &:hover:not(:disabled) { background: var(--color-primary-hover); }
      }
      .btn-ghost {
        background: transparent;
        color: var(--color-text-secondary);
        &:hover { color: var(--color-text-primary); }
      }
      .btn-outline {
        background: transparent;
        border: 1px solid var(--color-border);
        color: var(--color-text-primary);
        &:hover { border-color: var(--color-primary); color: var(--color-primary); }
      }
      .btn-full { width: 100%; }

      /* ── Professional selector ── */
      .prof-selector {
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
      }
      .prof-option {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        padding: var(--space-3) var(--space-4);
        border: 1.5px solid var(--color-border);
        border-radius: var(--radius-xl);
        background: var(--color-background);
        cursor: pointer;
        text-align: left;
        width: 100%;
        transition: all var(--transition-fast);
        &:hover {
          border-color: var(--color-primary);
          background: color-mix(in srgb, var(--color-primary) 4%, transparent);
        }
        &.prof-option--selected {
          border-color: var(--color-primary);
          background: color-mix(in srgb, var(--color-primary) 8%, transparent);
        }
      }
      .prof-option-avatar {
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 50%;
        object-fit: cover;
        flex-shrink: 0;
      }
      .prof-option-avatar--initials {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-bold);
      }
      .prof-option-avatar--any {
        background: var(--color-surface, #f1f5f9);
        display: flex;
        align-items: center;
        justify-content: center;
        svg {
          width: 1.25rem;
          height: 1.25rem;
          color: var(--color-text-muted);
        }
      }
      .prof-option-info {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 1px;
      }
      .prof-option-name {
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .prof-option-title {
        font-size: var(--font-size-xs);
        color: var(--color-text-muted);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .prof-option-check {
        width: 1.25rem;
        height: 1.25rem;
        flex-shrink: 0;
        color: var(--color-primary);
      }
    `,
  ],
})
export class BookingWizardComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private bookingService = inject(BookingPublicService);
  private availabilityService = inject(AvailabilityService);
  private turnstileService = inject(TurnstileService);

  // Route state
  slug = signal<string>("");
  serviceId = signal<string>("");

  // Data
  service = signal<Service | null>(null);
  professionals = signal<Professional[]>([]);
  loadingService = signal(true);

  // Form fields (step 1)
  formName = "";
  formPhone = "";
  formEmail = "";
  formProfessionalId = "";
  errors = signal<Record<string, string>>({});

  // Wizard state
  step = signal(1);

  // Availability / calendar
  busyPeriods = signal<BusyPeriod[]>([]);
  calendarInitialDate = signal<Date | undefined>(undefined);
  loadingAvailability = signal(false);
  selectedSlot = signal<TimeSlot | null>(null);

  // Auto-booking search
  autoSearching = signal(false);
  autoError = signal<string | null>(null);

  // Submission
  submitting = signal(false);
  submitError = signal<string | null>(null);
  bookingId = signal<string | null>(null);
  failedAvatarIds = signal<Set<string>>(new Set());

  ngOnInit() {
    // Slug from parent route (:slug)
    const parentParams = this.route.parent?.snapshot.paramMap;
    const slugVal = parentParams?.get("slug") ?? this.route.snapshot.paramMap.get("slug") ?? "";
    this.slug.set(slugVal);

    // serviceId from current route
    const svcId = this.route.snapshot.paramMap.get("serviceId") ?? "";
    this.serviceId.set(svcId);

    // Professional pre-selected from query param
    this.route.queryParams.subscribe((qp) => {
      if (qp["professional"]) this.formProfessionalId = qp["professional"];
    });

    // Load service data
    if (slugVal) {
      this.bookingService.getServices(slugVal).subscribe({
        next: (res) => {
          const svc = res.services.find((s) => s.id === svcId) ?? null;
          this.service.set(svc);
          this.professionals.set((res.professionals ?? []).filter(p => !!p.display_name));
          applyBrandingColors(res.company?.primary_color, res.company?.secondary_color);
          this.loadingService.set(false);
        },
        error: () => this.loadingService.set(false),
      });
    }
  }

  // ── Step 1 ────────────────────────────────────────────────
  goStep2() {
    const errs: Record<string, string> = {};
    if (!this.formName.trim()) errs["name"] = "El nombre es obligatorio";
    if (!this.formPhone.trim()) errs["phone"] = "El teléfono es obligatorio";
    if (!this.formEmail.trim()) errs["email"] = "El email es obligatorio";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.formEmail))
      errs["email"] = "Email no válido";
    this.errors.set(errs);
    if (Object.keys(errs).length === 0) this.step.set(2);
  }

  // ── Step 2 ────────────────────────────────────────────────
  selectMethodAuto() {
    this.autoError.set(null);
    this.autoSearching.set(true);
    const weekStart = this.availabilityService.getWeekStart(new Date());
    this.searchAutoSlot(weekStart, 0);
  }

  private searchAutoSlot(weekStart: Date, weeksChecked: number) {
    if (weeksChecked >= 4) {
      this.autoError.set("No hay disponibilidad en las próximas 4 semanas");
      this.autoSearching.set(false);
      return;
    }
    const weekStr = this.formatDateParam(weekStart);
    const profId = this.formProfessionalId || undefined;
    this.bookingService.getAvailability(this.slug(), weekStr, profId).subscribe({
      next: (res) => {
        const days = this.availabilityService.generateWeekDays(weekStart);
        for (const day of days) {
          const slot = this.availabilityService.getFirstAvailableSlot(
            day,
            res.busy_periods,
            this.service()?.duration_minutes ?? 30,
          );
          if (slot) {
            this.busyPeriods.set(res.busy_periods);
            this.calendarInitialDate.set(slot.datetime);
            this.selectedSlot.set(slot);
            this.autoSearching.set(false);
            this.step.set(3);
            return;
          }
        }
        const next = this.availabilityService.getNextWeek(weekStart);
        this.searchAutoSlot(next, weeksChecked + 1);
      },
      error: () => {
        this.autoError.set("Error al buscar disponibilidad");
        this.autoSearching.set(false);
      },
    });
  }

  clearAutoError() {
    this.autoError.set(null);
  }

  selectMethodManual() {
    const weekStart = this.availabilityService.getWeekStart(new Date());
    this.calendarInitialDate.set(weekStart);
    this.loadAvailability(weekStart);
    this.step.set(3);
  }

  // ── Step 3 ────────────────────────────────────────────────
  private loadAvailability(weekStart: Date) {
    this.loadingAvailability.set(true);
    const profId = this.formProfessionalId || undefined;
    this.bookingService
      .getAvailability(this.slug(), this.formatDateParam(weekStart), profId)
      .subscribe({
        next: (res) => {
          this.busyPeriods.set(res.busy_periods);
          this.loadingAvailability.set(false);
        },
        error: () => this.loadingAvailability.set(false),
      });
  }

  onWeekChanged(weekStart: Date) {
    this.selectedSlot.set(null);
    this.loadAvailability(weekStart);
  }

  onSlotSelected(slot: TimeSlot) {
    this.selectedSlot.set(slot);
    this.submitError.set(null);
  }

  async confirmBooking() {
    const slot = this.selectedSlot();
    const svc = this.service();
    if (!slot || !svc) return;

    this.submitting.set(true);
    this.submitError.set(null);

    let turnstile_token: string;
    try {
      await this.turnstileService.loadScript();
      const container = document.getElementById('cf-turnstile');
      if (container) container.innerHTML = '';
      turnstile_token = await this.turnstileService.render('cf-turnstile');
    } catch {
      this.submitting.set(false);
      this.submitError.set('Error en la verificación de seguridad. Inténtalo de nuevo.');
      return;
    }

    const datetime = this.buildDatetime(slot);
    this.bookingService
      .createBooking({
        slug: this.slug(),
        service_id: svc.id,
        professional_id: this.formProfessionalId || undefined,
        client_name: this.formName,
        client_email: this.formEmail,
        client_phone: this.formPhone,
        datetime,
        turnstile_token,
      })
      .subscribe({
        next: (res) => {
          this.submitting.set(false);
          if (res.success) {
            this.bookingId.set(res.booking_id ?? null);
            this.step.set(4);
          } else {
            this.submitError.set(res.message ?? "Error al crear la reserva");
          }
        },
        error: () => {
          this.submitting.set(false);
          this.submitError.set("No se pudo crear la reserva. Inténtalo de nuevo.");
        },
      });
  }

  // ── Helpers ───────────────────────────────────────────────
  onAvatarError(id: string): void {
    this.failedAvatarIds.update(s => new Set([...s, id]));
  }

  getInitials(name: string): string {
    if (!name) return '';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getAvatarColor(name: string): { bg: string; fg: string } {
    const palette = [
      { bg: '#dbeafe', fg: '#1d4ed8' },
      { bg: '#dcfce7', fg: '#15803d' },
      { bg: '#fce7f3', fg: '#9d174d' },
      { bg: '#fef3c7', fg: '#b45309' },
      { bg: '#ede9fe', fg: '#6d28d9' },
    ];
    if (!name) return palette[0];
    const idx = (name.charCodeAt(0) || 0) % palette.length;
    return palette[idx];
  }

  formatSlotDate(slot: TimeSlot): string {
    return slot.datetime.toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }) + " a las " + slot.startTime;
  }

  private formatDateParam(date: Date): string {
    return date.toISOString().split("T")[0];
  }

  private buildDatetime(slot: TimeSlot): string {
    const [hour, minute] = slot.startTime.split(":").map(Number);
    const d = new Date(slot.datetime);
    d.setHours(hour, minute, 0, 0);
    return d.toISOString();
  }
}

