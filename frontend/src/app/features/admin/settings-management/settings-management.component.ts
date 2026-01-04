import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { AdminService } from '../../../core/services/admin.service';
import { Setting } from '../../../core/models/admin.model';
import { APP_CONTENT } from '../../../core/content/app.content';

@Component({
  selector: 'app-settings-management',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, IconComponent, LoadingSpinnerComponent],
  templateUrl: './settings-management.component.html',
  styleUrl: './settings-management.component.css',
})
export class SettingsManagementComponent implements OnInit {
  private adminService = inject(AdminService);

  content = APP_CONTENT;
  settings = signal<Setting[]>([]);
  loading = signal(true);
  saving = signal(false);
  success = signal<string | null>(null);
  error = signal<string | null>(null);

  settingValues: Record<string, unknown> = {};
  originalValues: Record<string, unknown> = {};

  ngOnInit(): void {
    this.loadSettings();
  }

  private loadSettings(): void {
    this.adminService.getSettings().subscribe({
      next: (settings) => {
        this.settings.set(settings);
        settings.forEach((s) => {
          this.settingValues[s.key] = s.value;
          this.originalValues[s.key] = s.value;
        });
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Failed to load settings');
      },
    });
  }

  getSettingsByGroup(group: string): Setting[] {
    return this.settings().filter((s) => s.category === group);
  }

  get groups(): string[] {
    const groups = new Set(this.settings().map((s) => s.category));
    return Array.from(groups);
  }

  getSettingValue(key: string): string {
    const val = this.settingValues[key];
    return val !== null && val !== undefined ? String(val) : '';
  }

  hasChanges(): boolean {
    return Object.keys(this.settingValues).some(
      (key) => String(this.settingValues[key]) !== String(this.originalValues[key])
    );
  }

  discardChanges(): void {
    Object.keys(this.originalValues).forEach((key) => {
      this.settingValues[key] = this.originalValues[key];
    });
    this.success.set(null);
    this.error.set(null);
  }

  saveSettings(): void {
    this.saving.set(true);
    this.success.set(null);
    this.error.set(null);

    // Find changed settings
    const changedSettings = Object.keys(this.settingValues).filter(
      (key) => String(this.settingValues[key]) !== String(this.originalValues[key])
    );

    if (changedSettings.length === 0) {
      this.saving.set(false);
      this.success.set('No changes to save');
      return;
    }

    // Create update observables for each changed setting
    const updates = changedSettings.map((key) =>
      this.adminService.updateSetting(key, { value: this.settingValues[key] }).pipe(
        catchError((err) => {
          console.error(`Failed to update ${key}:`, err);
          return of(null);
        })
      )
    );

    forkJoin(updates).subscribe({
      next: (results) => {
        const successCount = results.filter((r) => r !== null).length;
        const failCount = results.filter((r) => r === null).length;

        // Update original values for successful saves
        changedSettings.forEach((key, index) => {
          if (results[index] !== null) {
            this.originalValues[key] = this.settingValues[key];
          }
        });

        this.saving.set(false);

        if (failCount === 0) {
          this.success.set(`${successCount} setting(s) saved successfully`);
        } else if (successCount > 0) {
          this.error.set(`${successCount} saved, ${failCount} failed`);
        } else {
          this.error.set('Failed to save settings');
        }
      },
      error: () => {
        this.saving.set(false);
        this.error.set('Failed to save settings');
      },
    });
  }
}

