import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ThemeService } from '../../../core/services';

/**
 * Auth Layout
 * Clean layout for login, register, forgot password pages.
 * Uses DARK theme for the dramatic auth experience.
 */
@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.scss',
})
export class AuthLayoutComponent implements OnInit, OnDestroy {
  private themeService = inject(ThemeService);

  ngOnInit(): void {
    // Auth pages use dark theme
    this.themeService.setTheme('dark');
  }

  ngOnDestroy(): void {
    // Reset to light theme when leaving auth
    this.themeService.setTheme('light');
  }
}
