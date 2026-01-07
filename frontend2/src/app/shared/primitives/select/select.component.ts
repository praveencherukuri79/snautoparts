import { Component, Input, forwardRef, signal, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

export interface SelectOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatSelectModule, MatIconModule],
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
  @Input() label = '';
  @Input() placeholder = 'Select an option';
  @Input() options: SelectOption<T>[] = [];
  @Input() hint = '';
  @Input() error = '';
  @Input() required = false;
  @Input() multiple = false;
  @Input() set disabled(value: boolean) {
    this.isDisabled.set(value);
  }
  
  // Optional FormControl for direct binding
  @Input() control?: FormControl<T | null>;

  @Output() selectionChange = new EventEmitter<T>();

  // Internal state
  value = signal<T | T[] | null>(null);
  isDisabled = signal(false);
  
  // Use provided control or create internal one
  get activeControl(): FormControl<T | null> {
    return this.control ?? new FormControl<T | null>(null);
  }
  
  ngOnInit(): void {
    // Sync initial value from control if provided
    if (this.control) {
      this.value.set(this.control.value);
    }
  }

  private onChange: (value: T | T[] | null) => void = () => {};
  private onTouched: () => void = () => {};

  onSelectionChange(value: T | T[]): void {
    this.value.set(value);
    this.onChange(value);
    if (!this.multiple) {
      this.selectionChange.emit(value as T);
    }
  }

  onBlur(): void {
    this.onTouched();
  }

  // ControlValueAccessor implementation
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

