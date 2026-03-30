import { Component, Input, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TranslocoModule } from "@jsverse/transloco";
import { TimeSlot } from "./time-slot.component";

@Component({
  selector: "app-selected-slot-display",
  standalone: true,
  imports: [CommonModule, TranslocoModule],
  template: `
    <div class="selected-slot-display" *ngIf="slot">
      <div class="slot-info">
        <span class="label">{{ "calendar.selected" | transloco }}:</span>
        <span class="slot-time">{{ slot.startTime }} - {{ slot.endTime }}</span>
      </div>

      <div class="slot-date">
        {{ formatDate(slot.datetime) }}
      </div>

      <button
        class="clear-btn"
        (click)="onClear()"
        [attr.aria-label]="'calendar.clearSelection' | transloco"
      >
        ×
      </button>
    </div>

    <div class="no-selection" *ngIf="!slot">
      <span>{{ "calendar.selectSlot" | transloco }}</span>
    </div>
  `,
  styles: [
    `
      .selected-slot-display {
        display: flex;
        align-items: center;
        gap: var(--space-4);
        padding: var(--space-4) var(--space-5);
        background: var(--color-primary-light);
        border-radius: var(--radius-lg);
        border: 1px solid var(--color-primary);
      }

      .slot-info {
        display: flex;
        align-items: center;
        gap: var(--space-2);
      }

      .label {
        font-weight: var(--font-weight-medium);
        color: var(--color-text-secondary);
      }

      .slot-time {
        font-weight: var(--font-weight-bold);
        color: var(--color-primary);
        font-size: var(--font-size-lg);
      }

      .slot-date {
        color: var(--color-text-secondary);
        font-size: var(--font-size-sm);
        flex: 1;
      }

      .clear-btn {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 1px solid var(--color-border);
        background: var(--color-surface);
        color: var(--color-text-secondary);
        font-size: var(--font-size-xl);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all var(--transition-fast);
      }

      .clear-btn:hover {
        background: var(--color-error);
        color: white;
        border-color: var(--color-error);
      }

      .no-selection {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--space-4);
        color: var(--color-text-disabled);
        font-style: italic;
      }
    `,
  ],
})
export class SelectedSlotDisplayComponent {
  @Input() slot: TimeSlot | null = null;
  @Output() clear = new EventEmitter<void>();

  formatDate(date: Date): string {
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  onClear() {
    this.clear.emit();
  }
}
