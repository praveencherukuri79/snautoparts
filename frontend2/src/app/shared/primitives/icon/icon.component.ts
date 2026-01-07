import { Component, Input, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './icon.component.html',
  styleUrl: './icon.component.scss',
})
export class IconComponent {
  @Input({ required: true }) name!: string;
  @Input() size: IconSize = 'md';
  @Input() color?: string;

  @HostBinding('class')
  get hostClasses(): string {
    return `icon-size-${this.size}`;
  }

  @HostBinding('style.color')
  get iconColor(): string | undefined {
    return this.color;
  }
}

