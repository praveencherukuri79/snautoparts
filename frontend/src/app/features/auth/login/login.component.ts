import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { APP_CONTENT } from '../../../core/content/app.content';
import { environment } from '../../../../environments/environment';
import { finalize } from 'rxjs';

interface MockCredential {
  email: string;
  password: string;
  role: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, HeaderComponent, FooterComponent, IconComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly cartService = inject(CartService);

  readonly content = APP_CONTENT;
  readonly error = signal<string | null>(null);
  readonly isLoading = signal(false);
  readonly showPassword = signal(false);

  // Show mock credentials only in dev mode with mock data enabled
  readonly showMockCredentials = environment.enableMockData;
  
  readonly mockCredentials: MockCredential[] = [
    { email: 'admin@snautoparts.com', password: 'Admin123!', role: 'ADMIN' },
    { email: 'manager@snautoparts.com', password: 'Manager123!', role: 'MANAGER' },
    { email: 'customer@example.com', password: 'Customer123!', role: 'CUSTOMER' },
  ];

  readonly loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    rememberMe: [false],
  });

  onSubmit(): void {
    if (this.loginForm.invalid || this.isLoading()) {
      return;
    }

    this.error.set(null);
    this.isLoading.set(true);

    const { email, password } = this.loginForm.value;

    this.authService
      .login({ email, password })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          // Sync cart after successful login
          this.cartService.syncCart();
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
          this.router.navigateByUrl(returnUrl);
        },
        error: (err: Error) => {
          this.error.set(err.message || 'Invalid email or password');
        },
      });
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }

  fillCredentials(email: string, password: string): void {
    this.loginForm.patchValue({ email, password });
  }
}
