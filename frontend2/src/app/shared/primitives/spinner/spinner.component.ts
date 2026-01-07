import { Component, Input, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export type SpinnerSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.scss',
})
export class SpinnerComponent {
  @Input() size: SpinnerSize = 'md';
  @Input() color: 'primary' | 'accent' | 'warn' = 'primary';
  @Input() overlay = false;
  @Input() text = '';

  @HostBinding('class.app-spinner--overlay')
  get hasOverlay(): boolean {
    return this.overlay;
  }

  get diameter(): number {
    switch (this.size) {
      case 'sm':
        return 20;
      case 'lg':
        return 48;
      default:
        return 32;
    }
  }
}

