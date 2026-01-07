import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService, NotificationService } from '../../../core/services';
import { ButtonComponent } from '../../../shared/primitives/button/button.component';
import { InputComponent } from '../../../shared/primitives/input/input.component';
import { emailValidator, getErrorMessage } from '../../../shared/utils/form.utils';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    ButtonComponent,
    InputComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private notification = inject(NotificationService);

  isLoading = signal(false);
  
  form = this.fb.group({
    email: ['', [Validators.required, emailValidator()]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  get emailError(): string {
    return getErrorMessage(this.form.get('email'));
  }

  get passwordError(): string {
    return getErrorMessage(this.form.get('password'));
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    try {
      const { email, password } = this.form.value;
      await this.authService.login({ email: email!, password: password! });
      this.notification.success('Welcome back!');
      // Navigation is handled by AuthService.login() based on user role
    } catch (error) {
      this.notification.error('Invalid email or password');
    } finally {
      this.isLoading.set(false);
    }
  }
}

