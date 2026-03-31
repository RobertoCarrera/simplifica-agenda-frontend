import { Component, OnInit, signal, inject } from "@angular/core";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { TranslocoModule } from "@jsverse/transloco";
import { CommonModule } from "@angular/common";

interface BookingData {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  professionalId: string | null;
  method: "auto" | "manual" | null;
  slot: { date: Date; time: string } | null;
}

@Component({
  selector: "app-booking-wizard",
  standalone: true,
  imports: [FormsModule, TranslocoModule, CommonModule, RouterLink],
  template: `
    <div class="booking-wizard">
      <header class="wizard-header">
        <a [routerLink]="['/', slug(), 'servicios']" class="back-link"
          >&larr; {{ "nav.home" | transloco }}</a
        >
        <h1>{{ "booking.title" | transloco }}</h1>
      </header>

      <!-- Progress Steps -->
      <div class="progress-steps">
        <div
          class="step"
          [class.active]="currentStep() >= 1"
          [class.completed]="currentStep() > 1"
        >
          <span class="step-number">1</span>
          <span class="step-label">{{ "booking.step1" | transloco }}</span>
        </div>
        <div class="step-line" [class.active]="currentStep() > 1"></div>
        <div
          class="step"
          [class.active]="currentStep() >= 2"
          [class.completed]="currentStep() > 2"
        >
          <span class="step-number">2</span>
          <span class="step-label">{{ "booking.step2" | transloco }}</span>
        </div>
        <div class="step-line" [class.active]="currentStep() > 2"></div>
        <div class="step" [class.active]="currentStep() >= 3">
          <span class="step-number">3</span>
          <span class="step-label">{{ "booking.step3" | transloco }}</span>
        </div>
      </div>

      <!-- Step Content -->
      <div class="step-content">
        @switch (currentStep()) {
          @case (1) {
            <!-- Step 1: Personal Data -->
            <div class="step1-form">
              <h2>{{ "booking.step1" | transloco }}</h2>

              <div class="form-group">
                <label for="clientName"
                  >{{ "booking.personal.name" | transloco }} *</label
                >
                <input
                  type="text"
                  id="clientName"
                  [(ngModel)]="bookingData.clientName"
                  [placeholder]="'booking.personal.namePlaceholder' | transloco"
                  [class.invalid]="errors()['clientName']"
                />
                @if (errors()["clientName"]) {
                  <span class="error-message">{{
                    errors()["clientName"] | transloco
                  }}</span>
                }
              </div>

              <div class="form-group">
                <label for="clientEmail"
                  >{{ "booking.personal.email" | transloco }} *</label
                >
                <input
                  type="email"
                  id="clientEmail"
                  [(ngModel)]="bookingData.clientEmail"
                  [placeholder]="
                    'booking.personal.emailPlaceholder' | transloco
                  "
                  [class.invalid]="errors()['clientEmail']"
                />
                @if (errors()["clientEmail"]) {
                  <span class="error-message">{{
                    errors()["clientEmail"] | transloco
                  }}</span>
                }
              </div>

              <div class="form-group">
                <label for="clientPhone"
                  >{{ "booking.personal.phone" | transloco }} *</label
                >
                <input
                  type="tel"
                  id="clientPhone"
                  [(ngModel)]="bookingData.clientPhone"
                  [placeholder]="
                    'booking.personal.phonePlaceholder' | transloco
                  "
                  [class.invalid]="errors()['clientPhone']"
                />
                @if (errors()["clientPhone"]) {
                  <span class="error-message">{{
                    errors()["clientPhone"] | transloco
                  }}</span>
                }
              </div>

              <div class="form-actions">
                <button class="btn btn-primary" (click)="nextStep()">
                  {{ "booking.continue" | transloco }}
                </button>
              </div>
            </div>
          }

          @case (2) {
            <!-- Step 2: Method Selection -->
            <div class="step2-method">
              <h2>{{ "booking.method.title" | transloco }}</h2>

              <div class="method-options">
                <div
                  class="method-card"
                  [class.selected]="bookingData.method === 'auto'"
                  (click)="selectMethod('auto')"
                >
                  <h3>{{ "booking.method.firstAvailable" | transloco }}</h3>
                  <p>{{ "booking.method.firstAvailableDesc" | transloco }}</p>
                </div>

                <div
                  class="method-card"
                  [class.selected]="bookingData.method === 'manual'"
                  (click)="selectMethod('manual')"
                >
                  <h3>{{ "booking.method.chooseTime" | transloco }}</h3>
                  <p>{{ "booking.method.chooseTimeDesc" | transloco }}</p>
                </div>
              </div>

              <div class="form-actions">
                <button class="btn btn-secondary" (click)="prevStep()">
                  {{ "booking.back" | transloco }}
                </button>
                <button
                  class="btn btn-primary"
                  (click)="nextStep()"
                  [disabled]="!bookingData.method"
                >
                  {{ "booking.continue" | transloco }}
                </button>
              </div>
            </div>
          }

          @case (3) {
            <!-- Step 3: Calendar -->
            <div class="step3-calendar">
              <h2>{{ "booking.calendar.title" | transloco }}</h2>

              <div class="calendar-placeholder">
                <p class="text-muted">
                  {{ "booking.calendar.noSlots" | transloco }}
                </p>
              </div>

              <div class="form-actions">
                <button class="btn btn-secondary" (click)="prevStep()">
                  {{ "booking.back" | transloco }}
                </button>
              </div>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [
    `
      .booking-wizard {
        max-width: 600px;
        margin: 0 auto;
        padding: var(--space-8) var(--space-4);
      }

      .wizard-header {
        margin-bottom: var(--space-6);

        .back-link {
          display: inline-block;
          margin-bottom: var(--space-4);
          font-size: var(--font-size-sm);
          color: var(--color-text-secondary);
        }

        h1 {
          font-size: var(--font-size-2xl);
        }
      }

      .progress-steps {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: var(--space-8);
      }

      .step {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        color: var(--color-text-muted);

        &.active {
          color: var(--color-primary);

          .step-number {
            background: var(--color-primary);
            color: white;
          }
        }

        &.completed {
          .step-number {
            background: var(--color-success);
            color: white;
          }
        }
      }

      .step-number {
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background: var(--color-surface);
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-semibold);
      }

      .step-label {
        font-size: var(--font-size-sm);

        @media (max-width: 480px) {
          display: none;
        }
      }

      .step-line {
        width: 40px;
        height: 2px;
        background: var(--color-border);
        margin: 0 var(--space-2);

        &.active {
          background: var(--color-success);
        }
      }

      .step-content {
        background: var(--color-background);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg);
        padding: var(--space-6);
      }

      .step1-form,
      .step2-method,
      .step3-calendar {
        h2 {
          font-size: var(--font-size-xl);
          margin-bottom: var(--space-6);
        }
      }

      .form-actions {
        display: flex;
        gap: var(--space-4);
        margin-top: var(--space-6);
      }

      .method-options {
        display: grid;
        gap: var(--space-4);
      }

      .method-card {
        padding: var(--space-5);
        border: 2px solid var(--color-border);
        border-radius: var(--radius-lg);
        cursor: pointer;
        transition: all var(--transition-fast);

        &:hover {
          border-color: var(--color-primary-light);
        }

        &.selected {
          border-color: var(--color-primary);
          background: var(--color-primary-light);
        }

        h3 {
          font-size: var(--font-size-base);
          margin-bottom: var(--space-2);
        }

        p {
          font-size: var(--font-size-sm);
          color: var(--color-text-secondary);
        }
      }

      .calendar-placeholder {
        min-height: 200px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    `,
  ],
})
export class BookingWizardComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  currentStep = signal(1);
  bookingData: BookingData = {
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    professionalId: null,
    method: null,
    slot: null,
  };
  errors = signal<Record<string, string>>({});
  slug = signal<string>("");
  serviceId = signal<string>("");

  ngOnInit() {
    // Get slug from parent route (the :slug param)
    const parentSnapshot = this.route.parent?.snapshot;
    if (parentSnapshot) {
      const slugParam = parentSnapshot.paramMap.get("slug");
      if (slugParam) {
        this.slug.set(slugParam);
      }
    }

    // Get serviceId from current route params
    const serviceIdParam = this.route.snapshot.paramMap.get("serviceId");
    if (serviceIdParam) {
      this.serviceId.set(serviceIdParam);
    }

    // Also check for professional in query params
    this.route.queryParams.subscribe((queryParams) => {
      if (queryParams["professional"]) {
        this.bookingData.professionalId = queryParams["professional"];
      }
    });
  }

  selectMethod(method: "auto" | "manual") {
    this.bookingData.method = method;
  }

  nextStep() {
    const currentSlug = this.slug();

    if (this.currentStep() === 1) {
      if (this.validateStep1()) {
        this.currentStep.set(2);
      }
    } else if (this.currentStep() === 2) {
      if (this.bookingData.method === "auto") {
        // Auto-slot: skip to confirmation
        this.router.navigate(["/", currentSlug, "confirmacion", "auto"]);
      } else {
        this.currentStep.set(3);
      }
    }
  }

  prevStep() {
    if (this.currentStep() > 1) {
      this.currentStep.update((s) => s - 1);
    }
  }

  validateStep1(): boolean {
    const errs: Record<string, string> = {};

    if (!this.bookingData.clientName.trim()) {
      errs["clientName"] = "booking.errors.nameRequired";
    }

    if (!this.bookingData.clientEmail.trim()) {
      errs["clientEmail"] = "booking.errors.emailRequired";
    } else if (!this.isValidEmail(this.bookingData.clientEmail)) {
      errs["clientEmail"] = "booking.errors.emailInvalid";
    }

    if (!this.bookingData.clientPhone.trim()) {
      errs["clientPhone"] = "booking.errors.phoneRequired";
    }

    this.errors.set(errs);
    return Object.keys(errs).length === 0;
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
