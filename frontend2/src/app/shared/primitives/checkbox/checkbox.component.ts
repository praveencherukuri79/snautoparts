import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';

export type CheckboxColor = 'primary' | 'accent' | 'warn';

/**
 * Checkbox Primitive
 * Uses Angular Material checkbox directly.
 */
@Component({
  selector: 'app-checkbox',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCheckboxModule],
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.scss',
})
export class CheckboxComponent {
  readonly control = input.required<FormControl<boolean>>();
  readonly color = input<CheckboxColor>('primary');
  readonly disabled = input(false);
  readonly labelPosition = input<'before' | 'after'>('after');
}
