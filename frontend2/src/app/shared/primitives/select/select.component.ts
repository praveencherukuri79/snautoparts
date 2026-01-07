import { Component, input, output, forwardRef, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

export interface SelectOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

/**
 * Select Primitive
 * Uses Angular Material select with outline appearance.
 */
@Component({
  selector: 'app-select',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatSelectModule],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
})
export class SelectComponent<T = string> implements ControlValueAccessor, OnInit {
  readonly label = input('');
  readonly placeholder = input('Select an option');
  readonly options = input<SelectOption<T>[]>([]);
  readonly hint = input('');
  readonly error = input('');
  readonly required = input(false);
  readonly multiple = input(false);
  readonly control = input<FormControl<T | null>>();

  readonly selectionChange = output<T>();

  value = signal<T | T[] | null>(null);
  isDisabled = signal(false);

  private onChange: (value: T | T[] | null) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnInit(): void {
    const ctrl = this.control();
    if (ctrl) {
      this.value.set(ctrl.value);
    }
  }

  onSelectionChange(value: T | T[]): void {
    this.value.set(value);
    this.onChange(value);
    if (!this.multiple()) {
      this.selectionChange.emit(value as T);
    }
  }

  onBlur(): void {
    this.onTouched();
  }

  writeValue(value: T | T[] | null): void {
    this.value.set(value);
  }

  registerOnChange(fn: (value: T | T[] | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }
}
