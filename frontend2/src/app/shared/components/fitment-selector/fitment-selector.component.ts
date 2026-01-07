import { Component, inject, signal, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SelectComponent, SelectOption } from '../../primitives/select/select.component';
import { ButtonComponent } from '../../primitives/button/button.component';
import { CatalogService } from '../../../core/services/catalog.service';

export interface FitmentSelection {
  year: number;
  make: string;
  model: string;
}

@Component({
  selector: 'app-fitment-selector',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SelectComponent, ButtonComponent],
  templateUrl: './fitment-selector.component.html',
  styleUrl: './fitment-selector.component.scss',
})
export class FitmentSelectorComponent implements OnInit {
  private catalogService = inject(CatalogService);
  private router = inject(Router);

  @Output() fitmentSelected = new EventEmitter<FitmentSelection>();

  // Form controls
  yearControl = new FormControl<number | null>(null);
  makeControl = new FormControl<string | null>(null);
  modelControl = new FormControl<string | null>(null);

  // Options
  years = signal<SelectOption<number>[]>([]);
  makes = signal<SelectOption<string>[]>([]);
  models = signal<SelectOption<string>[]>([]);

  // Loading states
  loadingMakes = signal(false);
  loadingModels = signal(false);

  ngOnInit(): void {
    this.loadYears();
  }

  private loadYears(): void {
    const currentYear = new Date().getFullYear();
    const yearOptions: SelectOption<number>[] = [];
    for (let year = currentYear + 1; year >= 1990; year--) {
      yearOptions.push({ value: year, label: String(year) });
    }
    this.years.set(yearOptions);
  }

  async onYearChange(year: number | null): Promise<void> {
    this.makeControl.reset();
    this.modelControl.reset();
    this.makes.set([]);
    this.models.set([]);

    if (year) {
      this.loadingMakes.set(true);
      try {
        const makes = await this.catalogService.getFitmentMakes(year);
        this.makes.set(makes.map(m => ({ value: m, label: m })));
      } finally {
        this.loadingMakes.set(false);
      }
    }
  }

  async onMakeChange(make: string | null): Promise<void> {
    this.modelControl.reset();
    this.models.set([]);

    const year = this.yearControl.value;
    if (year && make) {
      this.loadingModels.set(true);
      try {
        const models = await this.catalogService.getFitmentModels(year, make);
        this.models.set(models.map(m => ({ value: m, label: m })));
      } finally {
        this.loadingModels.set(false);
      }
    }
  }

  get isComplete(): boolean {
    return !!(this.yearControl.value && this.makeControl.value && this.modelControl.value);
  }

  search(): void {
    if (!this.isComplete) return;

    const selection: FitmentSelection = {
      year: this.yearControl.value!,
      make: this.makeControl.value!,
      model: this.modelControl.value!,
    };

    this.fitmentSelected.emit(selection);
    this.router.navigate(['/products'], {
      queryParams: {
        year: selection.year,
        make: selection.make,
        model: selection.model,
      },
    });
  }
}

