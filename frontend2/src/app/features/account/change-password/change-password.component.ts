import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormTemplates, markFormTouched, resetForm } from '@shared/utils/form.utils';
import { FormFieldComponent } from '@shared/primitives/form-field/form-field.component';
import { ButtonComponent } from '@shared/primitives/button/button.component';
import { CardComponent } from '@shared/primitives/card/card.component';
import { AuthService, NotificationService } from '@core/services';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormFieldComponent, ButtonComponent, CardComponent],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss',
})
export class ChangePasswordComponent {
  private authService = inject(AuthService);
  private notification = inject(NotificationService);

  form = FormTemplates.changePassword();
  isSubmitting = signal(false);

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      markFormTouched(this.form);
      return;
    }

    this.isSubmitting.set(true);
    try {
      await this.authService.changePassword(
        this.form.value.currentPassword!,
        this.form.value.newPassword!
      );
      resetForm(this.form);
      this.notification.success('Password changed successfully');
    } catch {
      this.notification.error('Failed to change password. Please check your current password.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}



