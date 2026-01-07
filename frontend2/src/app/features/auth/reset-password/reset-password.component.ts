import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService, NotificationService } from '../../../core/services';
import { ButtonComponent } from '../../../shared/primitives/button/button.component';
import { InputComponent } from '../../../shared/primitives/input/input.component';
import { confirmPasswordValidator, getErrorMessage } from '../../../shared/utils/form.utils';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    ButtonComponent,
    InputComponent,
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private notification = inject(NotificationService);

  isLoading = signal(false);
  token = signal<string | null>(null);

  form = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required, confirmPasswordValidator('password')]],
  });

  ngOnInit(): void {
    this.token.set(this.route.snapshot.queryParamMap.get('token'));
  }

  getError(field: string): string {
    return getErrorMessage(this.form.get(field));
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid || !this.token()) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    try {
      await this.authService.resetPassword(this.token()!, this.form.value.password!);
      this.notification.success('Password reset successfully!');
      this.router.navigate(['/login']);
    } catch (error) {
      this.notification.error('Failed to reset password. The link may have expired.');
    } finally {
      this.isLoading.set(false);
    }
  }
}

