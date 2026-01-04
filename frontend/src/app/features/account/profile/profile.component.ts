import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { AuthService } from '../../../core/services/auth.service';
import { APP_CONTENT } from '../../../core/content/app.content';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, HeaderComponent, FooterComponent, IconComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  content = APP_CONTENT;
  readonly user = this.authService.user;
  saving = signal(false);
  success = signal<string | null>(null);
  error = signal<string | null>(null);

  profileForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
  });

  passwordForm: FormGroup = this.fb.group({
    currentPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
  });

  ngOnInit(): void {
    const currentUser = this.user();
    if (currentUser) {
      this.profileForm.patchValue({
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        email: currentUser.email,
        phone: currentUser.phone || '',
      });
    }
  }

  updateProfile(): void {
    if (this.profileForm.valid) {
      this.saving.set(true);
      this.success.set(null);
      this.error.set(null);
      
      const { firstName, lastName, email, phone } = this.profileForm.value;
      
      this.authService.updateProfile({ firstName, lastName, email, phone }).subscribe({
        next: () => {
          this.saving.set(false);
          this.success.set('Profile updated successfully!');
        },
        error: (err: Error) => {
          this.saving.set(false);
          this.error.set(err.message || 'Failed to update profile');
        },
      });
    }
  }

  changePassword(): void {
    if (this.passwordForm.valid) {
      const { currentPassword, newPassword, confirmPassword } = this.passwordForm.value;
      if (newPassword !== confirmPassword) {
        this.error.set('Passwords do not match');
        return;
      }
      
      this.saving.set(true);
      this.error.set(null);
      this.success.set(null);
      
      this.authService.changePassword(currentPassword, newPassword).subscribe({
        next: () => {
          this.saving.set(false);
          this.success.set('Password changed successfully!');
          this.passwordForm.reset();
        },
        error: (err: Error) => {
          this.saving.set(false);
          this.error.set(err.message || 'Failed to change password');
        },
      });
    }
  }
}

