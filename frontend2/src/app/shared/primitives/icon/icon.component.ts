import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Icon Primitive
 * Wraps Material icon with size variants.
 */
@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './icon.component.html',
  styleUrl: './icon.component.scss',
  host: {
    '[class]': '"icon-" + size()',
    '[style.color]': 'color()',
  }
})
export class IconComponent {
  readonly name = input.required<string>();
  readonly size = input<IconSize>('md');
  readonly color = input<string>();
}
