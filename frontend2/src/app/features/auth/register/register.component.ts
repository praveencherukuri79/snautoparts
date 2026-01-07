import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService, NotificationService } from '../../../core/services';
import { ButtonComponent } from '../../../shared/primitives/button/button.component';
import { InputComponent } from '../../../shared/primitives/input/input.component';
import { emailValidator, confirmPasswordValidator, getErrorMessage } from '../../../shared/utils/form.utils';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    ButtonComponent,
    InputComponent,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private notification = inject(NotificationService);

  isLoading = signal(false);

  form = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, emailValidator()]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required, confirmPasswordValidator('password')]],
  });

  getError(field: string): string {
    return getErrorMessage(this.form.get(field));
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    try {
      const { firstName, lastName, email, password } = this.form.value;
      await this.authService.register({
        firstName: firstName!,
        lastName: lastName!,
        email: email!,
        password: password!,
      });
      this.notification.success('Account created successfully!');
      this.router.navigate(['/']);
    } catch (error) {
      this.notification.error('Registration failed. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }
}

