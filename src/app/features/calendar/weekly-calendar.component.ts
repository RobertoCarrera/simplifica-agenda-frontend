import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
  inject,
  signal,
  computed,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { TranslocoModule } from "@jsverse/transloco";
import {
  AvailabilityService,
  WeekDay,
  CalendarDay,
} from "../../services/availability.service";
import { TimeSlotComponent, TimeSlot } from "./time-slot.component";
import { BusyPeriod } from "../../services/booking-public.service";

@Component({
  selector: "app-weekly-calendar",
  standalone: true,
  imports: [CommonModule, TranslocoModule, TimeSlotComponent],
  template: `
    <div class="calendar-container">
      <!-- Navigation -->
      <div class="calendar-nav">
        <button
          class="nav-btn"
          (click)="previousWeek()"
          [attr.aria-label]="'calendar.previousWeek' | transloco"
        >
          ←
        </button>
        <span class="week-label">{{ weekLabel() }}</span>
        <button
          class="nav-btn"
          (click)="nextWeek()"
          [attr.aria-label]="'calendar.nextWeek' | transloco"
        >
          →
        </button>
      </div>

      <!-- Week Days Grid -->
      <div class="week-grid">
        <div
          class="day-column"
          *ngFor="let day of weekDays(); let i = index"
          [class.today]="day.isToday"
        >
          <div class="day-header">
            <span class="day-name">{{ day.dayName }}</span>
            <span class="day-number" [class.today-badge]="day.isToday">
              {{ day.dayNumber }}
            </span>
          </div>

          <div class="slots-container">
            <app-time-slot
              *ngFor="let slot of getSlotsForDay(i)"
              [slot]="slot"
              (select)="onSlotSelect($event)"
            />

            <div class="no-slots" *ngIf="getSlotsForDay(i).length === 0">
              <span>{{ "calendar.noSlots" | transloco }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Selected Slot Display -->
      <div class="selected-slot" *ngIf="selectedSlot()">
        <span class="label">{{ "calendar.selected" | transloco }}:</span>
        <span class="slot-time">
          {{ selectedSlot()?.startTime }} - {{ selectedSlot()?.endTime }}
        </span>
        <span class="slot-date">{{ formatSelectedDate() }}</span>
      </div>
    </div>
  `,
  styles: [
    `
      .calendar-container {
        background: var(--color-surface);
        border-radius: var(--radius-lg);
        padding: var(--space-6);
        border: 1px solid var(--color-border);
      }

      .calendar-nav {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--space-6);
        padding-bottom: var(--space-4);
        border-bottom: 1px solid var(--color-border);
      }

      .nav-btn {
        padding: var(--space-2) var(--space-4);
        background: var(--color-surface-hover);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        cursor: pointer;
        font-size: var(--font-size-lg);
        transition: all var(--transition-fast);
      }

      .nav-btn:hover {
        background: var(--color-primary);
        color: white;
        border-color: var(--color-primary);
      }

      .week-label {
        font-weight: var(--font-weight-semibold);
        color: var(--color-text-primary);
        font-size: var(--font-size-lg);
      }

      .week-grid {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: var(--space-4);
      }

      .day-column {
        display: flex;
        flex-direction: column;
        min-height: 300px;
      }

      .day-column.today {
        background: var(--color-primary-light);
        border-radius: var(--radius-md);
        padding: var(--space-2);
      }

      .day-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-1);
        padding: var(--space-3);
        margin-bottom: var(--space-3);
        text-align: center;
      }

      .day-name {
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);
        color: var(--color-text-secondary);
        text-transform: uppercase;
      }

      .day-number {
        font-size: var(--font-size-xl);
        font-weight: var(--font-weight-bold);
        color: var(--color-text-primary);
      }

      .today-badge {
        background: var(--color-primary);
        color: white;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .slots-container {
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
        overflow-y: auto;
        max-height: 350px;
      }

      .no-slots {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--space-4);
        color: var(--color-text-disabled);
        font-size: var(--font-size-sm);
      }

      .selected-slot {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        margin-top: var(--space-6);
        padding: var(--space-4);
        background: var(--color-primary-light);
        border-radius: var(--radius-md);
        border: 1px solid var(--color-primary);
      }

      .selected-slot .label {
        font-weight: var(--font-weight-medium);
        color: var(--color-text-secondary);
      }

      .selected-slot .slot-time {
        font-weight: var(--font-weight-bold);
        color: var(--color-primary);
        font-size: var(--font-size-lg);
      }

      .selected-slot .slot-date {
        color: var(--color-text-secondary);
        font-size: var(--font-size-sm);
        margin-left: auto;
      }

      @media (max-width: 768px) {
        .week-grid {
          grid-template-columns: repeat(2, 1fr);
        }

        .day-column:nth-child(5) {
          grid-column: span 2;
        }
      }

      @media (max-width: 480px) {
        .week-grid {
          grid-template-columns: 1fr;
        }

        .day-column:nth-child(5) {
          grid-column: span 1;
        }
      }
    `,
  ],
})
export class WeeklyCalendarComponent implements OnInit, OnChanges {
  @Input() busyPeriods: BusyPeriod[] = [];
  @Input() serviceDuration: number = 30;
  @Input() initialDate?: Date;
  @Output() slotSelected = new EventEmitter<TimeSlot>();
  @Output() weekChanged = new EventEmitter<Date>();

  private availabilityService = inject(AvailabilityService);

  weekStart = signal<Date>(new Date());
  selectedSlot = signal<TimeSlot | null>(null);

  weekDays = signal<WeekDay[]>([]);
  calendarDays = signal<CalendarDay[]>([]);

  weekLabel = computed(() => {
    const start = this.weekStart();
    const end = new Date(start);
    end.setDate(start.getDate() + 4); // Friday

    const startStr = start.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
    });
    const endStr = end.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
    });
    return `${startStr} - ${endStr}`;
  });

  ngOnInit() {
    if (this.initialDate) {
      this.weekStart.set(
        this.availabilityService.getWeekStart(this.initialDate),
      );
    }
    this.generateCalendar();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['busyPeriods'] && !changes['busyPeriods'].firstChange) {
      this.generateCalendar();
    }
  }

  private generateCalendar() {
    const days = this.availabilityService.generateWeekDays(this.weekStart());
    this.weekDays.set(days);

    const calendarDays: CalendarDay[] = days.map((day) => ({
      day,
      slots: this.availabilityService.generateTimeSlots(
        day,
        this.busyPeriods,
        this.serviceDuration,
        this.selectedSlot()?.id,
      ),
    }));

    this.calendarDays.set(calendarDays);
  }

  getSlotsForDay(dayIndex: number): TimeSlot[] {
    return this.calendarDays()[dayIndex]?.slots || [];
  }

  onSlotSelect(slot: TimeSlot) {
    // Find which day column this slot belongs to
    const dayIndex = this.calendarDays().findIndex((cd) =>
      cd.slots.some((s) => s.id === slot.id),
    );

    if (dayIndex === -1) return;

    // Update selection state
    const updatedDays = this.calendarDays().map((cd, i) => {
      if (i === dayIndex) {
        return {
          ...cd,
          slots: cd.slots.map((s) => ({
            ...s,
            isSelected: s.id === slot.id,
          })),
        };
      }
      return {
        ...cd,
        slots: cd.slots.map((s) => ({ ...s, isSelected: false })),
      };
    });

    this.calendarDays.set(updatedDays);
    this.selectedSlot.set(slot);
    this.slotSelected.emit(slot);
  }

  previousWeek() {
    const prev = this.availabilityService.getPreviousWeek(this.weekStart());
    this.weekStart.set(prev);
    this.selectedSlot.set(null);
    this.generateCalendar();
    this.weekChanged.emit(prev);
  }

  nextWeek() {
    const next = this.availabilityService.getNextWeek(this.weekStart());
    this.weekStart.set(next);
    this.selectedSlot.set(null);
    this.generateCalendar();
    this.weekChanged.emit(next);
  }

  formatSelectedDate(): string {
    const slot = this.selectedSlot();
    if (!slot) return "";
    return slot.datetime.toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  }
}
