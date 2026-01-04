import { Component, inject, signal, OnInit, computed, HostListener } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { AdminService } from '../../../core/services/admin.service';
import { User, UserRole } from '../../../core/models/user.model';
import { APP_CONTENT } from '../../../core/content/app.content';

@Component({
  selector: 'app-users-management',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, IconComponent, LoadingSpinnerComponent, DatePipe],
  templateUrl: './users-management.component.html',
  styleUrl: './users-management.component.css',
})
export class UsersManagementComponent implements OnInit {
  private adminService = inject(AdminService);

  content = APP_CONTENT;
  users = signal<User[]>([]);
  loading = signal(true);
  
  searchQuery = '';
  roleFilter = '';
  statusFilter = '';
  activeMenuUserId: string | null = null;

  roleOptions: UserRole[] = ['CUSTOMER', 'MANAGER', 'ADMIN'];

  // Computed filtered users
  filteredUsers = computed(() => {
    let filtered = this.users();
    
    // Apply search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(user => 
        (user.firstName || '').toLowerCase().includes(query) ||
        (user.lastName || '').toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      );
    }
    
    // Apply role filter
    if (this.roleFilter) {
      filtered = filtered.filter(user => user.role === this.roleFilter);
    }
    
    // Apply status filter (for now all users are active)
    // This would work with a real status field from backend
    
    return filtered;
  });

  ngOnInit(): void {
    this.loadUsers();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(): void {
    this.activeMenuUserId = null;
  }

  private loadUsers(): void {
    this.adminService.getUsers().subscribe({
      next: (result) => {
        this.users.set(result.users);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  onSearchChange(): void {
    // Force re-computation of filteredUsers
    // The computed signal will automatically update when we read it
    // We just need to trigger change detection which ngModel does
  }

  applyFilters(): void {
    // Filters are applied reactively through the computed signal
  }

  toggleActionMenu(userId: string): void {
    event?.stopPropagation();
    this.activeMenuUserId = this.activeMenuUserId === userId ? null : userId;
  }

  updateRole(user: User, newRole: string): void {
    this.adminService.updateUserRole(user.id, newRole).subscribe({
      next: (updated) => {
        this.users.update((users) =>
          users.map((u) => (u.id === updated.id ? updated : u))
        );
      },
    });
  }

  openAddUserModal(): void {
    // TODO: Open add user modal
    alert('Add User modal coming soon. For now, users can self-register.');
  }

  editUser(user: User): void {
    this.activeMenuUserId = null;
    // TODO: Open edit user modal
    alert(`Edit user: ${user.firstName} ${user.lastName}`);
  }

  changeRole(user: User): void {
    this.activeMenuUserId = null;
    const newRole = prompt(`Change role for ${user.firstName} ${user.lastName}. Current: ${user.role}\nEnter new role (CUSTOMER, MANAGER, ADMIN):`, user.role);
    if (newRole && this.roleOptions.includes(newRole as UserRole)) {
      this.updateRole(user, newRole);
    }
  }

  disableUser(user: User): void {
    this.activeMenuUserId = null;
    if (confirm(`Are you sure you want to disable the account for ${user.firstName} ${user.lastName}?`)) {
      // TODO: Implement disable user API
      alert('Disable user functionality coming soon.');
    }
  }

  getInitials(user: User): string {
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
  }

  getAvatarClass(user: User): string {
    switch (user.role) {
      case 'ADMIN':
        return 'bg-purple-500';
      case 'MANAGER':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  }

  getRoleBadgeClass(role: UserRole): string {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800';
      case 'MANAGER':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700';
    }
  }

  getRoleIcon(role: UserRole): string {
    switch (role) {
      case 'ADMIN':
        return 'admin_panel_settings';
      case 'MANAGER':
        return 'manage_accounts';
      default:
        return 'person';
    }
  }
}
