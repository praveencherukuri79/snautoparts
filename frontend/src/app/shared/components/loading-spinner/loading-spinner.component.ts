import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-center" [style.height.px]="height">
      <div 
        class="spinner"
        [style.width.px]="size"
        [style.height.px]="size"
      ></div>
    </div>
  `,
})
export class LoadingSpinnerComponent {
  @Input() size = 32;
  @Input() height = 200;
}

