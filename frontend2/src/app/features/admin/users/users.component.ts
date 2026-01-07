import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '@core/services';
import { UserListItem } from '@core/models';
import { DataTableComponent, TableColumn } from '@shared/components/data-table/data-table.component';
import { ButtonComponent } from '@shared/primitives/button/button.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, DataTableComponent, ButtonComponent],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
})
export class UsersComponent implements OnInit {
  private userService = inject(UserService);

  users = signal<UserListItem[]>([]);
  isLoading = signal(true);
  total = signal(0);
  currentPage = signal(1);
  pageSize = 20;

  columns: TableColumn<UserListItem>[] = [
    { key: 'email', label: 'Email', sortable: true },
    { key: 'firstName', label: 'Name' },
    { key: 'role', label: 'Role' },
    { key: 'isActive', label: 'Status' },
    { key: 'createdAt', label: 'Created', sortable: true },
  ];

  async ngOnInit(): Promise<void> {
    await this.loadUsers();
  }

  async loadUsers(): Promise<void> {
    this.isLoading.set(true);
    try {
      const result = await this.userService.getUsers({
        page: this.currentPage(),
        limit: this.pageSize,
      });
      this.users.set(result.data);
      this.total.set(result.meta.total);
    } finally {
      this.isLoading.set(false);
    }
  }

  async onPageChange(page: number): Promise<void> {
    this.currentPage.set(page);
    await this.loadUsers();
  }

  getRoleVariant(role: string): 'info' | 'warning' | 'success' | 'neutral' {
    const roleMap: Record<string, 'info' | 'warning' | 'success' | 'neutral'> = {
      ADMIN: 'warning',
      MANAGER: 'info',
      CUSTOMER: 'neutral',
    };
    return roleMap[role] || 'neutral';
  }
}

