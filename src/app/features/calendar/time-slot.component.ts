import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  computed,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { TranslocoModule } from "@jsverse/transloco";

export interface TimeSlot {
  id: string;
  datetime: Date;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  isPast: boolean;
  isSelected: boolean;
}

@Component({
  selector: "app-time-slot",
  standalone: true,
  imports: [CommonModule, TranslocoModule],
  template: `
    <button
      class="time-slot"
      [class.available]="slot.isAvailable && !slot.isPast"
      [class.occupied]="!slot.isAvailable"
      [class.past]="slot.isPast"
      [class.selected]="slot.isSelected"
      [disabled]="!slot.isAvailable || slot.isPast"
      (click)="onSelect()"
      [attr.aria-label]="slot.startTime"
    >
      <span class="time">{{ slot.startTime }}</span>
    </button>
  `,
  styles: [
    `
      .time-slot {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--space-2) var(--space-3);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        background: var(--color-surface);
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);
        cursor: pointer;
        transition: all var(--transition-fast);
        min-width: 70px;
      }

      .time-slot.available:hover {
        border-color: var(--color-primary);
        background: var(--color-primary-light);
      }

      .time-slot.occupied {
        background: var(--color-surface-hover);
        color: var(--color-text-disabled);
        cursor: not-allowed;
        text-decoration: line-through;
      }

      .time-slot.past {
        background: var(--color-surface-hover);
        color: var(--color-text-disabled);
        cursor: not-allowed;
      }

      .time-slot.selected {
        background: var(--color-primary);
        border-color: var(--color-primary);
        color: var(--color-primary-text);
      }

      .time-slot:disabled {
        cursor: not-allowed;
      }

      .time {
        white-space: nowrap;
      }
    `,
  ],
})
export class TimeSlotComponent {
  @Input({ required: true }) slot!: TimeSlot;
  @Output() select = new EventEmitter<TimeSlot>();

  onSelect() {
    if (this.slot.isAvailable && !this.slot.isPast) {
      this.select.emit(this.slot);
    }
  }
}
