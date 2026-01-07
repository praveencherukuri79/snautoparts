import { Component, Input, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';

export type CardVariant = 'default' | 'outlined' | 'elevated';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
})
export class CardComponent {
  @Input() variant: CardVariant = 'default';
  @Input() padding: CardPadding = 'md';
  @Input() hoverable = false;
  @Input() clickable = false;

  @HostBinding('class')
  get hostClasses(): string {
    const classes = [
      'app-card',
      `app-card--${this.variant}`,
      `app-card--padding-${this.padding}`,
    ];

    if (this.hoverable) classes.push('app-card--hoverable');
    if (this.clickable) classes.push('app-card--clickable');

    return classes.join(' ');
  }

  @HostBinding('attr.tabindex')
  get tabIndex(): number | null {
    return this.clickable ? 0 : null;
  }

  @HostBinding('attr.role')
  get role(): string | null {
    return this.clickable ? 'button' : null;
  }
}

