import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  duration?: number;
  action?: string;
  horizontalPosition?: 'start' | 'center' | 'end' | 'left' | 'right';
  verticalPosition?: 'top' | 'bottom';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private snackBar = inject(MatSnackBar);

  private readonly defaultOptions: ToastOptions = {
    duration: 4000,
    horizontalPosition: 'end',
    verticalPosition: 'top',
  };

  /**
   * Show a success toast
   */
  success(message: string, options?: ToastOptions): void {
    this.show(message, 'success', options);
  }

  /**
   * Show an error toast
   */
  error(message: string, options?: ToastOptions): void {
    this.show(message, 'error', { ...options, duration: 6000 });
  }

  /**
   * Show a warning toast
   */
  warning(message: string, options?: ToastOptions): void {
    this.show(message, 'warning', options);
  }

  /**
   * Show an info toast
   */
  info(message: string, options?: ToastOptions): void {
    this.show(message, 'info', options);
  }

  private show(message: string, type: ToastType, options?: ToastOptions): void {
    const config: MatSnackBarConfig = {
      duration: options?.duration ?? this.defaultOptions.duration,
      horizontalPosition: options?.horizontalPosition ?? this.defaultOptions.horizontalPosition,
      verticalPosition: options?.verticalPosition ?? this.defaultOptions.verticalPosition,
      panelClass: [`toast-${type}`],
    };

    this.snackBar.open(message, options?.action ?? 'Close', config);
  }

  /**
   * Dismiss the current toast
   */
  dismiss(): void {
    this.snackBar.dismiss();
  }
}


