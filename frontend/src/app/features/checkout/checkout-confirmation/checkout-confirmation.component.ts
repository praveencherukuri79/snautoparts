import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models/order.model';
import { APP_CONTENT } from '../../../core/content/app.content';

@Component({
  selector: 'app-checkout-confirmation',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent, IconComponent, LoadingSpinnerComponent, CurrencyPipe, DatePipe],
  templateUrl: './checkout-confirmation.component.html',
  styleUrl: './checkout-confirmation.component.css',
})
export class CheckoutConfirmationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);

  content = APP_CONTENT;
  order = signal<Order | null>(null);
  loading = signal(true);

  ngOnInit(): void {
    const orderId = this.route.snapshot.params['orderId'];
    if (orderId) {
      this.loadOrder(orderId);
    }
  }

  private loadOrder(orderId: string): void {
    this.orderService.getOrderById(orderId).subscribe({
      next: (order) => {
        this.order.set(order);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }
}

