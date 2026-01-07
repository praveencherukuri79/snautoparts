import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
export type BadgeSize = 'sm' | 'md' | 'lg';

/**
 * Badge Primitive
 * Status indicators and labels.
 */
@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './badge.component.html',
  styleUrl: './badge.component.scss',
  host: {
    '[class]': 'hostClasses()',
  }
})
export class BadgeComponent {
  readonly variant = input<BadgeVariant>('default');
  readonly size = input<BadgeSize>('md');
  readonly dot = input(false);
  readonly rounded = input(false);

  readonly hostClasses = computed(() => {
    const classes = [
      'badge',
      `badge--${this.variant()}`,
      `badge--${this.size()}`,
    ];
    if (this.dot()) classes.push('badge--dot');
    if (this.rounded()) classes.push('badge--rounded');
    return classes.join(' ');
  });
}
