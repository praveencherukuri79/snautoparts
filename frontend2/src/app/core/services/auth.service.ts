import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import { FeatureConfigService } from './feature-config.service';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'CUSTOMER' | 'MANAGER' | 'ADMIN';
  avatarUrl?: string;
}

export interface ProfileUpdateData {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

// API response types
interface AuthResponse {
  success: boolean;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string | null;
    role: string;
  };
}

interface SessionResponse {
  authenticated: boolean;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string | null;
    role: string;
  } | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private api = inject(ApiService);
  private router = inject(Router);
  private featureConfig = inject(FeatureConfigService);

  private currentUser = signal<User | null>(null);

  readonly user = this.currentUser.asReadonly();
  readonly isAuthenticated = computed(() => !!this.currentUser());

  constructor() {
    // Restore session from storage
    this.restoreSession();
  }

  private restoreSession(): void {
    const storedUser = localStorage.getItem('auth_user');

    if (storedUser) {
      try {
        this.currentUser.set(JSON.parse(storedUser));
        // Load feature config for restored user
        this.featureConfig.loadConfig();
      } catch {
        this.clearSession();
      }
    }
  }

  getToken(): string | null {
    // Session-based auth - no token needed
    return null;
  }

  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<void> {
    const response = await firstValueFrom(
      this.http.post<AuthResponse>('/api/v1/auth/login', {
        email: credentials.email,
        password: credentials.password,
      }, { withCredentials: true })
    );

    const user: User = {
      id: response.user.id,
      email: response.user.email,
      firstName: response.user.firstName,
      lastName: response.user.lastName,
      phone: response.user.phone || undefined,
      role: response.user.role as User['role'],
    };

    this.currentUser.set(user);

    // Persist user info locally
    localStorage.setItem('auth_user', JSON.stringify(user));

    // Load feature config and update role from server
    await this.featureConfig.loadConfig();

    // Navigate based on feature config's dashboard layout
    const dashboardLayout = this.featureConfig.dashboardLayout();
    if (dashboardLayout === 'customer') {
      this.router.navigate(['/']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<void> {
    const response = await firstValueFrom(
      this.http.post<AuthResponse>('/api/v1/auth/register', {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      }, { withCredentials: true })
    );

    const user: User = {
      id: response.user.id,
      email: response.user.email,
      firstName: response.user.firstName,
      lastName: response.user.lastName,
      phone: response.user.phone || undefined,
      role: response.user.role as User['role'],
    };

    this.currentUser.set(user);
    localStorage.setItem('auth_user', JSON.stringify(user));

    await this.featureConfig.loadConfig();
    this.router.navigate(['/']);
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post('/api/v1/auth/logout', {}, { withCredentials: true })
      );
    } catch {
      // Ignore logout API errors
    }

    this.clearSession();
    this.router.navigate(['/login']);
  }

  private clearSession(): void {
    this.currentUser.set(null);
    localStorage.removeItem('auth_user');
    this.featureConfig.clearConfig();
  }

  async forgotPassword(email: string): Promise<void> {
    await this.api.post('/auth/forgot-password', { email });
  }

  async resetPassword(token: string, password: string): Promise<void> {
    await this.api.post('/auth/reset-password', { token, newPassword: password });
  }

  /**
   * Get current session status from server
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await firstValueFrom(
        this.http.get<SessionResponse>('/api/v1/auth/session', { withCredentials: true })
      );

      if (response.authenticated && response.user) {
        const user: User = {
          id: response.user.id,
          email: response.user.email,
          firstName: response.user.firstName,
          lastName: response.user.lastName,
          phone: response.user.phone || undefined,
          role: response.user.role as User['role'],
        };
        this.currentUser.set(user);
        localStorage.setItem('auth_user', JSON.stringify(user));
        return user;
      }
      return null;
    } catch {
      this.clearSession();
      return null;
    }
  }

  /**
   * Get current user synchronously (returns null if not logged in)
   */
  getUser(): User | null {
    return this.currentUser();
  }

  /**
   * Update user profile
   */
  async updateProfile(data: ProfileUpdateData): Promise<User> {
    const updatedUser = await this.api.patch<User>('/auth/profile', data);
    this.currentUser.set(updatedUser);
    localStorage.setItem('auth_user', JSON.stringify(updatedUser));
    return updatedUser;
  }

  /**
   * Change user password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await this.api.post('/auth/change-password', { currentPassword, newPassword });
  }
}
