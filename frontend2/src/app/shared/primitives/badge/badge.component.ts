import { Component, Input, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
export type BadgeSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './badge.component.html',
  styleUrl: './badge.component.scss',
})
export class BadgeComponent {
  @Input() variant: BadgeVariant = 'default';
  @Input() size: BadgeSize = 'md';
  @Input() dot = false;
  @Input() rounded = false;

  @HostBinding('class')
  get hostClasses(): string {
    const classes = [
      'app-badge',
      `app-badge--${this.variant}`,
      `app-badge--${this.size}`,
    ];

    if (this.dot) classes.push('app-badge--dot');
    if (this.rounded) classes.push('app-badge--rounded');

    return classes.join(' ');
  }
}

