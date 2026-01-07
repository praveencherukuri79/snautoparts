import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ThemeService } from '../../../core/services';

/**
 * Main Layout
 * Customer-facing layout with header and footer.
 * Uses LIGHT theme for the shopping experience.
 */
@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent implements OnInit {
  private themeService = inject(ThemeService);

  ngOnInit(): void {
    // Main layout uses light theme
    this.themeService.setTheme('light');
  }
}
