import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';

export type CheckboxColor = 'primary' | 'accent' | 'warn';

@Component({
  selector: 'app-checkbox',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCheckboxModule],
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.scss',
})
export class CheckboxComponent {
  @Input({ required: true }) control!: FormControl<boolean>;
  @Input() color: CheckboxColor = 'primary';
  @Input() disabled = false;
  @Input() labelPosition: 'before' | 'after' = 'after';
}

