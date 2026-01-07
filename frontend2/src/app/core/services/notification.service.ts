import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private snackBar = inject(MatSnackBar);

  success(message: string, duration = 4000): void {
    this.show(message, 'toast-success', duration);
  }

  error(message: string, duration = 6000): void {
    this.show(message, 'toast-error', duration);
  }

  info(message: string, duration = 4000): void {
    this.show(message, 'toast-info', duration);
  }

  warning(message: string, duration = 5000): void {
    this.show(message, 'toast-warning', duration);
  }

  private show(message: string, panelClass: string, duration: number): void {
    this.snackBar.open(message, 'Close', {
      duration,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: [panelClass],
    });
  }
}

