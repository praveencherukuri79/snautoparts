import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-quantity-selector',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule],
  templateUrl: './quantity-selector.component.html',
  styleUrl: './quantity-selector.component.scss',
})
export class QuantitySelectorComponent {
  @Input() quantity = 1;
  @Input() min = 1;
  @Input() max = 99;
  @Input() disabled = false;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  @Output() quantityChange = new EventEmitter<number>();

  decrement(): void {
    if (this.quantity > this.min && !this.disabled) {
      this.quantity--;
      this.quantityChange.emit(this.quantity);
    }
  }

  increment(): void {
    if (this.quantity < this.max && !this.disabled) {
      this.quantity++;
      this.quantityChange.emit(this.quantity);
    }
  }

  onInputChange(value: string): void {
    const num = parseInt(value, 10);
    if (!isNaN(num)) {
      this.quantity = Math.max(this.min, Math.min(this.max, num));
      this.quantityChange.emit(this.quantity);
    }
  }

  get canDecrement(): boolean {
    return this.quantity > this.min && !this.disabled;
  }

  get canIncrement(): boolean {
    return this.quantity < this.max && !this.disabled;
  }
}

