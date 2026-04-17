import { Component, OnInit, signal, inject } from "@angular/core";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { TranslocoModule } from "@jsverse/transloco";

@Component({
  selector: "app-booking-success",
  standalone: true,
  imports: [RouterLink, TranslocoModule],
  template: `
    <div class="booking-success">
      <div class="success-card">
        <div class="success-icon">✓</div>
        <h1>{{ "booking.success.title" | transloco }}</h1>
        <p>{{ "booking.success.message" | transloco }}</p>

        <div class="booking-details">
          @if (bookingDetails()?.serviceName) {
            <div class="detail-row">
              <span class="label">Servicio:</span>
              <span class="value">{{ bookingDetails()!.serviceName }}</span>
            </div>
          }
          @if (bookingDetails()?.dateTime) {
            <div class="detail-row">
              <span class="label">Fecha:</span>
              <span class="value">{{ bookingDetails()!.dateTime }}</span>
            </div>
          }
          <div class="detail-row">
            <span class="label"
              >{{ "booking.success.bookingId" | transloco }}:</span
            >
            <span class="value">{{ bookingId() }}</span>
          </div>
        </div>

        <div class="success-actions">
          <button class="btn btn-primary" (click)="addToCalendar()">
            {{ "booking.success.addToCalendar" | transloco }}
          </button>
          <a
            [routerLink]="['/', slug(), 'servicios']"
            class="btn btn-secondary"
          >
            {{ "booking.success.backToHome" | transloco }}
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .booking-success {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--space-4);
        background: var(--color-surface);
      }

      .success-card {
        background: var(--color-background);
        border-radius: var(--radius-xl);
        padding: var(--space-8);
        text-align: center;
        max-width: 400px;
        width: 100%;
        box-shadow: var(--shadow-lg);
      }

      .success-icon {
        width: 64px;
        height: 64px;
        background: var(--color-success);
        color: white;
        font-size: var(--font-size-3xl);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto var(--space-6);
      }

      h1 {
        font-size: var(--font-size-2xl);
        margin-bottom: var(--space-2);
      }

      p {
        color: var(--color-text-secondary);
        margin-bottom: var(--space-6);
      }

      .booking-details {
        background: var(--color-surface);
        border-radius: var(--radius-md);
        padding: var(--space-4);
        margin-bottom: var(--space-6);

        .detail-row {
          display: flex;
          justify-content: space-between;

          .label {
            color: var(--color-text-secondary);
          }

          .value {
            font-weight: var(--font-weight-semibold);
          }
        }
      }

      .success-actions {
        display: flex;
        flex-direction: column;
        gap: var(--space-3);

        .btn {
          width: 100%;
        }
      }
    `,
  ],
})
export class BookingSuccessComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  bookingId = signal<string>("");
  slug = signal<string>("");
  bookingDetails = signal<{serviceName: string; dateTime: string; datetimeIso: string; durationMinutes: number} | null>(null);

  ngOnInit() {
    // Get slug from parent route
    const parentSnapshot = this.route.parent?.snapshot;
    if (parentSnapshot) {
      const slugParam = parentSnapshot.paramMap.get("slug");
      if (slugParam) {
        this.slug.set(slugParam);
      }
    }

    // Get bookingId from route params, fallback to sessionStorage
    const bookingIdParam = this.route.snapshot.paramMap.get("bookingId");
    if (bookingIdParam) {
      this.bookingId.set(bookingIdParam);
    } else {
      const storedId = sessionStorage.getItem('lastBookingId');
      this.bookingId.set(storedId ?? "N/A");
    }

    // Load booking details from sessionStorage
    const storedDetails = sessionStorage.getItem('lastBookingDetails');
    if (storedDetails) {
      try {
        this.bookingDetails.set(JSON.parse(storedDetails));
      } catch {
        // ignore parse errors
      }
    }
  }

  addToCalendar(): void {
    const details = this.bookingDetails();
    if (!details?.datetimeIso) return;

    const startDate = new Date(details.datetimeIso);
    const endDate = new Date(startDate.getTime() + (details.durationMinutes ?? 60) * 60 * 1000);

    const formatDate = (d: Date): string => {
      return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    };

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Simplifica//Booking//ES',
      'BEGIN:VEVENT',
      `DTSTART:${formatDate(startDate)}`,
      `DTEND:${formatDate(endDate)}`,
      `SUMMARY:${details.serviceName || 'Cita'} - Simplifica`,
      `DESCRIPTION:Reserva confirmada. Ref: ${this.bookingId()}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reserva-${this.bookingId()}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
