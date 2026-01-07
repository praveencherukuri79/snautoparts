import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export type SpinnerSize = 'sm' | 'md' | 'lg';

/**
 * Spinner Primitive
 * Loading indicator using Material spinner.
 */
@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.scss',
  host: {
    '[class.spinner--overlay]': 'overlay()',
  }
})
export class SpinnerComponent {
  readonly size = input<SpinnerSize>('md');
  readonly color = input<'primary' | 'accent' | 'warn'>('primary');
  readonly overlay = input(false);
  readonly text = input('');

  readonly diameter = computed(() => {
    switch (this.size()) {
      case 'sm': return 20;
      case 'lg': return 48;
      default: return 32;
    }
  });
}
