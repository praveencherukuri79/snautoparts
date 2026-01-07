import { Component, Input, Output, EventEmitter, signal, computed, ContentChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SelectionModel } from '@angular/cdk/collections';
import { PaginationComponent } from '../pagination/pagination.component';
import { SpinnerComponent } from '../../primitives/spinner/spinner.component';
import { EmptyStateComponent } from '../empty-state/empty-state.component';

export interface TableColumn<T = unknown> {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  template?: TemplateRef<{ $implicit: T; column: TableColumn<T> }>;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    MatCheckboxModule,
    PaginationComponent,
    SpinnerComponent,
    EmptyStateComponent,
  ],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss',
})
export class DataTableComponent<T extends { id: string }> {
  @Input({ required: true }) columns: TableColumn<T>[] = [];
  @Input({ required: true }) data: T[] = [];
  @Input() loading = false;
  @Input() selectable = false;
  @Input() paginated = true;
  @Input() total = 0;
  @Input() pageSize = 20;
  @Input() currentPage = 1;
  @Input() emptyIcon = 'inbox';
  @Input() emptyTitle = 'No data';
  @Input() emptyMessage = '';

  @Output() sortChange = new EventEmitter<Sort>();
  @Output() selectionChange = new EventEmitter<T[]>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();
  @Output() rowClick = new EventEmitter<T>();

  selection = new SelectionModel<T>(true, []);

  get displayedColumns(): string[] {
    const cols = this.columns.map(c => c.key);
    if (this.selectable) {
      return ['select', ...cols];
    }
    return cols;
  }

  isAllSelected(): boolean {
    return this.selection.selected.length === this.data.length;
  }

  isIndeterminate(): boolean {
    return this.selection.selected.length > 0 && !this.isAllSelected();
  }

  toggleAll(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.selection.select(...this.data);
    }
    this.selectionChange.emit(this.selection.selected);
  }

  toggleRow(row: T): void {
    this.selection.toggle(row);
    this.selectionChange.emit(this.selection.selected);
  }

  onSort(sort: Sort): void {
    this.sortChange.emit(sort);
  }

  onRowClick(row: T): void {
    this.rowClick.emit(row);
  }

  onPageChange(page: number): void {
    this.pageChange.emit(page);
  }

  onPageSizeChange(size: number): void {
    this.pageSizeChange.emit(size);
  }

  trackByFn(_index: number, item: T): string {
    return item.id;
  }
}


