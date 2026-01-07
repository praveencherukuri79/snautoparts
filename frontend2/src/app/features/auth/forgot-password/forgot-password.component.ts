import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService, NotificationService } from '../../../core/services';
import { ButtonComponent } from '../../../shared/primitives/button/button.component';
import { InputComponent } from '../../../shared/primitives/input/input.component';
import { emailValidator, getErrorMessage } from '../../../shared/utils/form.utils';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    ButtonComponent,
    InputComponent,
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private notification = inject(NotificationService);

  isLoading = signal(false);
  emailSent = signal(false);

  form = this.fb.group({
    email: ['', [Validators.required, emailValidator()]],
  });

  get emailError(): string {
    return getErrorMessage(this.form.get('email'));
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    try {
      await this.authService.forgotPassword(this.form.value.email!);
      this.emailSent.set(true);
      this.notification.success('Password reset email sent!');
    } catch (error) {
      this.notification.error('Failed to send reset email');
    } finally {
      this.isLoading.set(false);
    }
  }
}

