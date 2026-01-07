import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AdminService, NotificationService } from '@core/services';
import { CardComponent } from '@shared/primitives/card/card.component';
import { ButtonComponent } from '@shared/primitives/button/button.component';
import { SpinnerComponent } from '@shared/primitives/spinner/spinner.component';

@Component({
  selector: 'app-settings-general',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    CardComponent,
    ButtonComponent,
    SpinnerComponent,
  ],
  templateUrl: './settings-general.component.html',
  styleUrl: './settings-general.component.scss',
})
export class SettingsGeneralComponent implements OnInit {
  private fb = inject(FormBuilder);
  private adminService = inject(AdminService);
  private notification = inject(NotificationService);

  isLoading = signal(true);
  isSaving = signal(false);

  storeForm: FormGroup = this.fb.group({
    storeName: ['', Validators.required],
    storeEmail: ['', [Validators.required, Validators.email]],
    supportPhone: [''],
    storeAddress: [''],
  });

  businessForm: FormGroup = this.fb.group({
    currency: ['USD'],
    timezone: ['EST'],
    dateFormat: ['MM/DD/YYYY'],
    weightUnit: ['lb'],
  });

  orderForm: FormGroup = this.fb.group({
    orderNumberPrefix: ['ORD-'],
    lowStockThreshold: [5, [Validators.required, Validators.min(0)]],
    cartExpiryDays: [7, [Validators.required, Validators.min(1)]],
  });

  emailForm: FormGroup = this.fb.group({
    senderName: [''],
    replyToEmail: ['', Validators.email],
  });

  currencies = ['USD', 'CAD', 'EUR', 'GBP'];
  timezones = ['EST', 'CST', 'MST', 'PST', 'UTC'];
  dateFormats = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'];
  weightUnits = ['lb', 'kg', 'oz'];

  async ngOnInit(): Promise<void> {
    await this.loadSettings();
  }

  async loadSettings(): Promise<void> {
    this.isLoading.set(true);
    try {
      const settings = await this.adminService.getSettings('general');
      
      // Map settings to form values
      settings.forEach(s => {
        if (this.storeForm.get(s.key)) {
          this.storeForm.get(s.key)?.setValue(s.value);
        } else if (this.businessForm.get(s.key)) {
          this.businessForm.get(s.key)?.setValue(s.value);
        } else if (this.orderForm.get(s.key)) {
          this.orderForm.get(s.key)?.setValue(s.value);
        } else if (this.emailForm.get(s.key)) {
          this.emailForm.get(s.key)?.setValue(s.value);
        }
      });
    } catch {
      this.notification.error('Failed to load settings');
    } finally {
      this.isLoading.set(false);
    }
  }

  async onSave(): Promise<void> {
    this.isSaving.set(true);
    try {
      const allSettings = {
        ...this.storeForm.value,
        ...this.businessForm.value,
        ...this.orderForm.value,
        ...this.emailForm.value,
      };

      const updates = Object.entries(allSettings).map(([key, value]) => ({
        key,
        value: String(value),
      }));

      await this.adminService.updateSettings(updates);
      this.notification.success('Settings saved successfully');
    } catch {
      this.notification.error('Failed to save settings');
    } finally {
      this.isSaving.set(false);
    }
  }
}

