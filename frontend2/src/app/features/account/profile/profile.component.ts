import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormTemplates, markFormTouched } from '@shared/utils/form.utils';
import { FormFieldComponent } from '@shared/primitives/form-field/form-field.component';
import { ButtonComponent } from '@shared/primitives/button/button.component';
import { CardComponent } from '@shared/primitives/card/card.component';
import { AuthService, NotificationService } from '@core/services';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormFieldComponent, ButtonComponent, CardComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private notification = inject(NotificationService);

  form = FormTemplates.profile();
  isSubmitting = signal(false);

  async ngOnInit(): Promise<void> {
    const user = this.authService.getUser();
    if (user) {
      this.form.patchValue({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone ?? '',
      });
    }
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      markFormTouched(this.form);
      return;
    }

    this.isSubmitting.set(true);
    try {
      const formValue = this.form.getRawValue();
      await this.authService.updateProfile({
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        phone: formValue.phone || undefined,
      });
      this.notification.success('Profile updated successfully');
    } catch {
      this.notification.error('Failed to update profile');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}

