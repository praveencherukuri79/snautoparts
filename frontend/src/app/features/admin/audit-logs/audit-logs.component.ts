import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, DatePipe, JsonPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { AdminService } from '../../../core/services/admin.service';
import { AuditLog, AuditLogFilters } from '../../../core/models/admin.model';
import { APP_CONTENT } from '../../../core/content/app.content';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, IconComponent, LoadingSpinnerComponent, DatePipe, JsonPipe],
  templateUrl: './audit-logs.component.html',
  styleUrl: './audit-logs.component.css',
})
export class AuditLogsComponent implements OnInit {
  private adminService = inject(AdminService);

  content = APP_CONTENT;
  logs = signal<AuditLog[]>([]);
  loading = signal(true);
  
  actionFilter = '';
  entityFilter = '';
  currentPage = signal(1);
  totalPages = signal(1);

  ngOnInit(): void {
    this.loadLogs();
  }

  private loadLogs(): void {
    this.loading.set(true);
    const filters: AuditLogFilters = {};
    if (this.actionFilter) filters.action = this.actionFilter;
    if (this.entityFilter) filters.resource = this.entityFilter;

    this.adminService.getAuditLogs(filters, this.currentPage()).subscribe({
      next: (result) => {
        this.logs.set(result.logs);
        this.totalPages.set(result.totalPages);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  applyFilters(): void {
    this.currentPage.set(1);
    this.loadLogs();
  }

  getActionBadgeClass(action: string): string {
    switch (action) {
      case 'CREATE':
        return 'badge-success';
      case 'UPDATE':
        return 'badge-info';
      case 'DELETE':
        return 'badge-error';
      default:
        return '';
    }
  }
}

