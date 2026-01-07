import { Component, inject, signal, OnInit, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService, NotificationService } from '@core/services';
import { User, Role, UserFormData } from '@core/models';
import { ButtonComponent } from '@shared/primitives/button/button.component';
import { SelectOption } from '@shared/primitives/select/select.component';
import { SpinnerComponent } from '@shared/primitives/spinner/spinner.component';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    ButtonComponent,
    SpinnerComponent,
  ],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss',
})
export class UserFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private notification = inject(NotificationService);
  private router = inject(Router);

  id = input<string>();

  isEditMode = computed(() => !!this.id());
  user = signal<User | null>(null);
  roles = signal<Role[]>([]);
  isLoading = signal(true);
  isSaving = signal(false);
  isActive = signal(true);
  sendWelcomeEmail = signal(true);

  form!: FormGroup;

  roleOptions = computed<SelectOption<string>[]>(() => 
    this.roles().map(r => ({ value: r.id, label: r.displayName }))
  );

  async ngOnInit(): Promise<void> {
    this.initForm();
    await this.loadData();
  }

  private initForm(): void {
    this.form = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      roleId: ['', Validators.required],
      password: ['', this.isEditMode() ? [] : [Validators.required, Validators.minLength(8)]],
      confirmPassword: [''],
    });
  }

  private async loadData(): Promise<void> {
    this.isLoading.set(true);
    try {
      const roles = await this.userService.getRoles();
      this.roles.set(roles);

      if (this.isEditMode()) {
        const user = await this.userService.getUser(this.id()!);
        this.user.set(user);
        this.isActive.set(user.isActive);
        this.form.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          roleId: user.role?.id,
        });
      } else {
        // Default to Customer role
        const customerRole = roles.find(r => r.name === 'CUSTOMER');
        if (customerRole) {
          this.form.patchValue({ roleId: customerRole.id });
        }
      }
    } catch {
      this.notification.error('Failed to load form data');
    } finally {
      this.isLoading.set(false);
    }
  }

  toggleActive(): void {
    this.isActive.update(v => !v);
  }

  toggleWelcomeEmail(): void {
    this.sendWelcomeEmail.update(v => !v);
  }

  autoGeneratePassword(): void {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.form.patchValue({ password, confirmPassword: password });
    this.notification.success('Password generated');
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.notification.error('Please fill in all required fields');
      return;
    }

    const { password, confirmPassword, ...formData } = this.form.value;
    
    if (!this.isEditMode() && password !== confirmPassword) {
      this.notification.error('Passwords do not match');
      return;
    }

    this.isSaving.set(true);
    try {
      const data: UserFormData = {
        ...formData,
        isActive: this.isActive(),
      };

      if (password) {
        data.password = password;
      }

      if (this.isEditMode()) {
        await this.userService.updateUser(this.id()!, data);
        this.notification.success('User updated successfully');
      } else {
        await this.userService.createUser(data);
        this.notification.success('User created successfully');
      }

      this.router.navigate(['/users']);
    } catch (error) {
      this.notification.error(`Failed to ${this.isEditMode() ? 'update' : 'create'} user`);
    } finally {
      this.isSaving.set(false);
    }
  }

  getFieldError(field: string): string {
    const control = this.form.get(field);
    if (control?.touched && control.errors) {
      if (control.errors['required']) return `${field} is required`;
      if (control.errors['email']) return 'Invalid email format';
      if (control.errors['minlength']) return `Minimum ${control.errors['minlength'].requiredLength} characters`;
    }
    return '';
  }
}

