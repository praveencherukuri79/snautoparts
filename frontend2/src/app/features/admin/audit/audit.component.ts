import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '@core/services';
import { AuditLog } from '@core/models';
import { DataTableComponent, TableColumn } from '@shared/components/data-table/data-table.component';
import { SelectComponent, SelectOption } from '@shared/primitives/select/select.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DataTableComponent, SelectComponent],
  templateUrl: './audit.component.html',
  styleUrl: './audit.component.scss',
})
export class AuditComponent implements OnInit {
  private adminService = inject(AdminService);

  logs = signal<AuditLog[]>([]);
  isLoading = signal(true);
  total = signal(0);
  currentPage = signal(1);
  pageSize = 50;

  actionFilter = new FormControl<string>('');
  actionOptions: SelectOption<string>[] = [
    { value: '', label: 'All Actions' },
    { value: 'CREATE', label: 'Create' },
    { value: 'UPDATE', label: 'Update' },
    { value: 'DELETE', label: 'Delete' },
    { value: 'LOGIN', label: 'Login' },
    { value: 'LOGOUT', label: 'Logout' },
  ];

  columns: TableColumn<AuditLog>[] = [
    { key: 'action', label: 'Action' },
    { key: 'entity', label: 'Entity' },
    { key: 'entityId', label: 'Entity ID' },
    { key: 'userEmail', label: 'User' },
    { key: 'ipAddress', label: 'IP Address' },
    { key: 'createdAt', label: 'Date', sortable: true },
  ];

  async ngOnInit(): Promise<void> {
    await this.loadLogs();
  }

  async loadLogs(): Promise<void> {
    this.isLoading.set(true);
    try {
      const result = await this.adminService.getAuditLogs({
        page: this.currentPage(),
        limit: this.pageSize,
        action: this.actionFilter.value || undefined,
      });
      this.logs.set(result.data);
      this.total.set(result.meta.total);
    } finally {
      this.isLoading.set(false);
    }
  }

  async onPageChange(page: number): Promise<void> {
    this.currentPage.set(page);
    await this.loadLogs();
  }

  async onFilterChange(): Promise<void> {
    this.currentPage.set(1);
    await this.loadLogs();
  }
}

