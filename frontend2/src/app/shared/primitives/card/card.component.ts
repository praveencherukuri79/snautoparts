import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export type CardVariant = 'default' | 'outlined' | 'elevated';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

/**
 * Card Primitive
 * Container for content with optional border/shadow.
 */
@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
  host: {
    '[class]': 'hostClasses()',
    '[attr.tabindex]': 'clickable() ? 0 : null',
    '[attr.role]': 'clickable() ? "button" : null',
  }
})
export class CardComponent {
  readonly variant = input<CardVariant>('default');
  readonly padding = input<CardPadding>('md');
  readonly hoverable = input(false);
  readonly clickable = input(false);

  readonly hostClasses = computed(() => {
    const classes = [
      'card',
      `card--${this.variant()}`,
      `card--p-${this.padding()}`,
    ];
    if (this.hoverable()) classes.push('card--hoverable');
    if (this.clickable()) classes.push('card--clickable');
    return classes.join(' ');
  });
}
