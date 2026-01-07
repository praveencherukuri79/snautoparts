import { Component, inject, signal, OnInit, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService, NotificationService } from '@core/services';
import { Affiliate, AffiliateFormData } from '@core/models';
import { CardComponent } from '@shared/primitives/card/card.component';
import { FormFieldComponent } from '@shared/primitives/form-field/form-field.component';
import { ButtonComponent } from '@shared/primitives/button/button.component';
import { SpinnerComponent } from '@shared/primitives/spinner/spinner.component';

@Component({
  selector: 'app-affiliate-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    CardComponent,
    FormFieldComponent,
    ButtonComponent,
    SpinnerComponent,
  ],
  templateUrl: './affiliate-form.component.html',
  styleUrl: './affiliate-form.component.scss',
})
export class AffiliateFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private adminService = inject(AdminService);
  private notification = inject(NotificationService);

  id = input<string>();

  affiliate = signal<Affiliate | null>(null);
  isLoading = signal(true);
  isSaving = signal(false);
  isEditMode = signal(false);

  integrationTypes = ['API', 'EDI', 'EMAIL', 'FTP'];
  
  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    code: ['', [Validators.required, Validators.pattern(/^[A-Z0-9_]+$/)]],
    integrationType: ['API', Validators.required],
    apiUrl: [''],
    apiKey: [''],
    email: ['', Validators.email],
    ftpHost: [''],
    ftpUsername: [''],
    ftpPassword: [''],
    isEnabled: [true],
    lowStockThreshold: [10, [Validators.required, Validators.min(0)]],
    autoReorder: [false],
    priority: [1, [Validators.required, Validators.min(1)]],
    notes: [''],
  });

  async ngOnInit(): Promise<void> {
    const affiliateId = this.id();
    if (affiliateId) {
      this.isEditMode.set(true);
      await this.loadAffiliate(affiliateId);
    } else {
      this.isLoading.set(false);
    }
  }

  async loadAffiliate(id: string): Promise<void> {
    this.isLoading.set(true);
    try {
      const affiliate = await this.adminService.getAffiliate(id);
      this.affiliate.set(affiliate);
      
      this.form.patchValue({
        name: affiliate.name,
        code: affiliate.code,
        integrationType: affiliate.integrationType,
        apiUrl: affiliate.apiUrl || '',
        apiKey: affiliate.apiKey || '',
        email: affiliate.email || '',
        ftpHost: affiliate.ftpHost || '',
        ftpUsername: affiliate.ftpUsername || '',
        ftpPassword: '',
        isEnabled: affiliate.isEnabled,
        lowStockThreshold: affiliate.lowStockThreshold || 10,
        autoReorder: affiliate.autoReorder || false,
        priority: affiliate.priority || 1,
        notes: affiliate.notes || '',
      });
    } catch {
      this.notification.error('Failed to load affiliate');
      this.router.navigate(['/dropship/affiliates']);
    } finally {
      this.isLoading.set(false);
    }
  }

  get showApiFields(): boolean {
    return this.form.get('integrationType')?.value === 'API';
  }

  get showEmailFields(): boolean {
    return this.form.get('integrationType')?.value === 'EMAIL';
  }

  get showFtpFields(): boolean {
    return this.form.get('integrationType')?.value === 'FTP';
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    try {
      const formData: AffiliateFormData = {
        name: this.form.value.name,
        code: this.form.value.code,
        integrationType: this.form.value.integrationType,
        apiUrl: this.form.value.apiUrl || undefined,
        apiKey: this.form.value.apiKey || undefined,
        email: this.form.value.email || undefined,
        ftpHost: this.form.value.ftpHost || undefined,
        ftpUsername: this.form.value.ftpUsername || undefined,
        ftpPassword: this.form.value.ftpPassword || undefined,
        isEnabled: this.form.value.isEnabled,
        lowStockThreshold: this.form.value.lowStockThreshold,
        autoReorder: this.form.value.autoReorder,
        priority: this.form.value.priority,
        notes: this.form.value.notes || undefined,
      };

      if (this.isEditMode()) {
        await this.adminService.updateAffiliate(this.id()!, formData);
        this.notification.success('Affiliate updated successfully');
      } else {
        await this.adminService.createAffiliate(formData);
        this.notification.success('Affiliate created successfully');
      }

      this.router.navigate(['/dropship/affiliates']);
    } catch {
      this.notification.error(
        this.isEditMode() ? 'Failed to update affiliate' : 'Failed to create affiliate'
      );
    } finally {
      this.isSaving.set(false);
    }
  }

  generateCode(): void {
    const name = this.form.get('name')?.value || '';
    const code = name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '_')
      .replace(/_+/g, '_')
      .substring(0, 20);
    this.form.get('code')?.setValue(code);
  }
}

