import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { AdminService } from '../../../core/services/admin.service';
import { InventoryAdjustment } from '../../../core/models/admin.model';
import { APP_CONTENT } from '../../../core/content/app.content';

@Component({
  selector: 'app-inventory-adjustments',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent, LoadingSpinnerComponent, DatePipe],
  templateUrl: './inventory-adjustments.component.html',
  styleUrl: './inventory-adjustments.component.css',
})
export class InventoryAdjustmentsComponent implements OnInit {
  private adminService = inject(AdminService);

  content = APP_CONTENT;
  adjustments = signal<InventoryAdjustment[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.loadAdjustments();
  }

  private loadAdjustments(): void {
    // TODO: Backend doesn't have a global inventory adjustments endpoint yet
    // Need to implement GET /manager/inventory/adjustments on the backend
    this.adjustments.set([]);
    this.loading.set(false);
  }
}

