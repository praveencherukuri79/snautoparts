import { Component, Input, Output, EventEmitter, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, MatPaginatorModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
})
export class PaginationComponent {
  @Input({ required: true }) total!: number;
  @Input() pageSize = 20;
  @Input() currentPage = 1;
  @Input() pageSizeOptions = [10, 20, 50, 100];
  @Input() showFirstLastButtons = true;

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  get pageIndex(): number {
    return this.currentPage - 1;
  }

  onPageChange(event: PageEvent): void {
    if (event.pageSize !== this.pageSize) {
      this.pageSizeChange.emit(event.pageSize);
    }
    if (event.pageIndex + 1 !== this.currentPage) {
      this.pageChange.emit(event.pageIndex + 1);
    }
  }
}



