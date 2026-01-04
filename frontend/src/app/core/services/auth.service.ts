import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError, of, delay, map, tap, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  User,
  UserRole,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from '../models/user.model';

const TOKEN_KEY = 'sn_auth_token';
const USER_KEY = 'sn_user';

// Mock users for development
const MOCK_USERS: { email: string; password: string; user: User }[] = [
  {
    email: 'admin@snautoparts.com',
    password: 'Admin123!',
    user: {
      id: 'user-admin',
      email: 'admin@snautoparts.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
  {
    email: 'manager@snautoparts.com',
    password: 'Manager123!',
    user: {
      id: 'user-manager',
      email: 'manager@snautoparts.com',
      firstName: 'Manager',
      lastName: 'User',
      role: 'MANAGER',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
  {
    email: 'customer@example.com',
    password: 'Customer123!',
    user: {
      id: 'user-customer',
      email: 'customer@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phone: '555-123-4567',
      role: 'CUSTOMER',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
];

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/public/auth`;
  private readonly useMock = environment.enableMockData;
  
  // User state - only updated after successful async operations
  private readonly currentUser = signal<User | null>(null);

  // Public readonly signals
  readonly user = this.currentUser.asReadonly();
  readonly isLoggedIn = computed(() => !!this.currentUser());
  readonly userRole = computed(() => this.currentUser()?.role ?? null);

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router
  ) {
    this.initializeFromStorage();
  }

  /**
   * Load user from localStorage on service initialization
   */
  private initializeFromStorage(): void {
    const userJson = localStorage.getItem(USER_KEY);
    const token = localStorage.getItem(TOKEN_KEY);
    
    if (userJson && token) {
      try {
        const user = JSON.parse(userJson) as User;
        this.currentUser.set(user);
      } catch {
        this.clearStorage();
      }
    }
  }

  private clearStorage(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  private saveSession(user: User, token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.currentUser.set(user);
  }

  private handleAuthError(error: HttpErrorResponse): Observable<never> {
    const message = error.error?.message || error.message || 'Authentication failed';
    return throwError(() => new Error(message));
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.currentUser();
  }

  getUserRole(): UserRole {
    return this.currentUser()?.role || 'CUSTOMER';
  }

  /**
   * Login with email and password
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    if (this.useMock) {
      return this.mockLogin(credentials);
    }

    return this.http
      .post<{ data: AuthResponse }>(`${this.apiUrl}/login`, credentials)
      .pipe(
        map((response) => response.data),
        tap((authData) => this.saveSession(authData.user, authData.token)),
        catchError((error) => this.handleAuthError(error))
      );
  }

  private mockLogin(credentials: LoginRequest): Observable<AuthResponse> {
    const mockUser = MOCK_USERS.find(
      (u) =>
        u.email.toLowerCase() === credentials.email.toLowerCase() &&
        u.password === credentials.password
    );

    if (!mockUser) {
      // Return error observable with delay to simulate network
      return of(null).pipe(
        delay(300),
        map(() => {
          throw new Error('Invalid email or password');
        })
      );
    }

    const response: AuthResponse = {
      user: mockUser.user,
      token: `mock-token-${Date.now()}`,
    };

    return of(response).pipe(
      delay(300),
      tap((authData) => this.saveSession(authData.user, authData.token))
    );
  }

  /**
   * Register new user
   */
  register(data: RegisterRequest): Observable<AuthResponse> {
    if (this.useMock) {
      return this.mockRegister(data);
    }

    return this.http
      .post<{ data: AuthResponse }>(`${this.apiUrl}/register`, data)
      .pipe(
        map((response) => response.data),
        tap((authData) => this.saveSession(authData.user, authData.token)),
        catchError((error) => this.handleAuthError(error))
      );
  }

  private mockRegister(data: RegisterRequest): Observable<AuthResponse> {
    // Check if email already exists in mock users
    const exists = MOCK_USERS.some(
      (u) => u.email.toLowerCase() === data.email.toLowerCase()
    );

    if (exists) {
      return of(null).pipe(
        delay(300),
        map(() => {
          throw new Error('An account with this email already exists');
        })
      );
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      role: 'CUSTOMER',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const response: AuthResponse = {
      user: newUser,
      token: `mock-token-${Date.now()}`,
    };

    return of(response).pipe(
      delay(300),
      tap((authData) => this.saveSession(authData.user, authData.token))
    );
  }

  /**
   * Logout current user
   */
  logout(): void {
    this.clearStorage();
    this.currentUser.set(null);
    this.router.navigate(['/']);
  }

  /**
   * Request password reset
   */
  forgotPassword(data: ForgotPasswordRequest): Observable<{ message: string }> {
    if (this.useMock) {
      return of({ message: 'If an account exists, a reset email has been sent' }).pipe(delay(300));
    }
    return this.http.post<{ message: string }>(`${this.apiUrl}/forgot-password`, data);
  }

  /**
   * Reset password with token
   */
  resetPassword(data: ResetPasswordRequest): Observable<{ message: string }> {
    if (this.useMock) {
      return of({ message: 'Password has been reset successfully' }).pipe(delay(300));
    }
    return this.http.post<{ message: string }>(`${this.apiUrl}/reset-password`, data);
  }

  /**
   * Refresh user data from server
   */
  refreshUser(): Observable<User | null> {
    if (!this.isAuthenticated()) {
      return of(null);
    }

    if (this.useMock) {
      // Return current user for mock
      return of(this.currentUser());
    }

    return this.http.get<{ data: User }>(`${this.apiUrl}/me`).pipe(
      map((response) => response.data),
      tap((user) => {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        this.currentUser.set(user);
      }),
      catchError(() => {
        this.logout();
        return of(null);
      })
    );
  }

  /**
   * Update user profile
   */
  updateProfile(data: Partial<User>): Observable<User> {
    if (this.useMock) {
      return this.mockUpdateProfile(data);
    }

    return this.http
      .patch<{ data: User }>(`${environment.apiUrl}/customer/profile`, data)
      .pipe(
        map((response) => response.data),
        tap((user) => {
          localStorage.setItem(USER_KEY, JSON.stringify(user));
          this.currentUser.set(user);
        }),
        catchError((error) => this.handleAuthError(error))
      );
  }

  private mockUpdateProfile(data: Partial<User>): Observable<User> {
    const current = this.currentUser();
    if (!current) {
      return throwError(() => new Error('Not authenticated'));
    }

    const updated: User = {
      ...current,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    return of(updated).pipe(
      delay(300),
      tap((user) => {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        this.currentUser.set(user);
      })
    );
  }

  /**
   * Change user password
   */
  changePassword(currentPassword: string, newPassword: string): Observable<{ message: string }> {
    if (this.useMock) {
      return this.mockChangePassword(currentPassword, newPassword);
    }

    return this.http
      .post<{ message: string }>(`${environment.apiUrl}/customer/profile/change-password`, {
        currentPassword,
        newPassword,
      })
      .pipe(catchError((error) => this.handleAuthError(error)));
  }

  private mockChangePassword(currentPassword: string, _newPassword: string): Observable<{ message: string }> {
    // In mock mode, just validate the current password against known mock passwords
    const current = this.currentUser();
    if (!current) {
      return throwError(() => new Error('Not authenticated'));
    }

    const mockUser = MOCK_USERS.find((u) => u.email === current.email);
    if (mockUser && mockUser.password !== currentPassword) {
      return of(null).pipe(
        delay(300),
        map(() => {
          throw new Error('Current password is incorrect');
        })
      );
    }

    return of({ message: 'Password changed successfully' }).pipe(delay(300));
  }
}
