import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span 
      class="material-symbols-outlined" 
      [class.filled]="filled"
      [style.font-size.px]="size"
      [attr.aria-hidden]="true">
      {{ name }}
    </span>
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
  `]
})
export class IconComponent {
  @Input({ required: true }) name!: string;
  @Input() size = 24;
  @Input() filled = false;
}

