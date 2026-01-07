import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService } from '@core/services';
import { OrderTrackingResult, OrderItem, OrderTimelineEntry } from '@core/models';
import { SpinnerComponent } from '@shared/primitives/spinner/spinner.component';
import { ButtonComponent } from '@shared/primitives/button/button.component';

interface TrackingStep {
  icon: string;
  label: string;
  date?: string;
  isActive: boolean;
  isCurrent: boolean;
}

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    CurrencyPipe,
    SpinnerComponent,
    ButtonComponent,
  ],
  templateUrl: './order-tracking.component.html',
  styleUrl: './order-tracking.component.scss',
})
export class OrderTrackingComponent implements OnInit {
  private orderService = inject(OrderService);
  private route = inject(ActivatedRoute);

  // Form state
  searchOrderNumber = signal('');
  
  // Order data
  order = signal<OrderTrackingResult | null>(null);
  timeline = signal<OrderTimelineEntry[]>([]);
  trackingSteps = signal<TrackingStep[]>([]);
  
  // UI state
  isLoading = signal(false);
  notFound = signal(false);
  hasSearched = signal(false);

  async ngOnInit(): Promise<void> {
    // Check if order number is in URL
    const orderNumber = this.route.snapshot.paramMap.get('orderNumber');
    if (orderNumber) {
      this.searchOrderNumber.set(orderNumber);
      await this.trackOrder();
    }
  }

  async trackOrder(): Promise<void> {
    const orderNumber = this.searchOrderNumber().trim();
    if (!orderNumber) return;

    this.isLoading.set(true);
    this.notFound.set(false);
    this.hasSearched.set(true);

    try {
      const order = await this.orderService.trackOrder(orderNumber);
      if (order) {
        this.order.set(order);
        this.buildTrackingSteps(order);
        
        // Set timeline from the tracking result
        this.timeline.set(order.timeline ?? []);
      } else {
        this.order.set(null);
        this.notFound.set(true);
      }
    } catch {
      this.order.set(null);
      this.notFound.set(true);
    } finally {
      this.isLoading.set(false);
    }
  }

  private buildTrackingSteps(order: OrderTrackingResult): void {
    const statusOrder = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
    const currentIndex = statusOrder.indexOf(order.status);

    const orderedDate = order.createdAt 
      ? new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) 
      : undefined;

    const steps: TrackingStep[] = [
      {
        icon: 'check_circle',
        label: 'Ordered',
        date: orderedDate,
        isActive: currentIndex >= 0,
        isCurrent: currentIndex === 0,
      },
      {
        icon: 'inventory_2',
        label: 'Processing',
        date: currentIndex >= 2 ? 'Completed' : undefined,
        isActive: currentIndex >= 2,
        isCurrent: currentIndex === 1 || currentIndex === 2,
      },
      {
        icon: 'local_shipping',
        label: 'On the way',
        date: currentIndex >= 3 ? 'In Transit' : undefined,
        isActive: currentIndex >= 3,
        isCurrent: currentIndex === 3,
      },
      {
        icon: 'home',
        label: 'Delivered',
        date: currentIndex >= 4 ? 'Completed' : undefined,
        isActive: currentIndex >= 4,
        isCurrent: currentIndex === 4,
      },
    ];

    this.trackingSteps.set(steps);
  }

  getEstimatedDelivery(): string {
    const order = this.order();
    if (!order) return '';
    
    // If already delivered
    if (order.status === 'DELIVERED') {
      return 'Delivered';
    }
    
    // Use estimated delivery from result or calculate (5-7 days from order date)
    if (order.estimatedDelivery) {
      return order.estimatedDelivery;
    }
    
    if (order.createdAt) {
      const orderDate = new Date(order.createdAt);
      const estimatedDate = new Date(orderDate);
      estimatedDate.setDate(estimatedDate.getDate() + 5);
      return `Arriving by ${estimatedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}`;
    }
    
    return 'Delivery date pending';
  }

  getCarrierLogo(carrier?: string): string {
    const logos: Record<string, string> = {
      'fedex': 'assets/carriers/fedex.svg',
      'ups': 'assets/carriers/ups.svg',
      'usps': 'assets/carriers/usps.svg',
      'dhl': 'assets/carriers/dhl.svg',
    };
    return logos[carrier?.toLowerCase() || ''] || '';
  }

  getCarrierTrackingUrl(carrier?: string, trackingNumber?: string): string {
    if (!carrier || !trackingNumber) return '';
    
    const urls: Record<string, string> = {
      'fedex': `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`,
      'ups': `https://www.ups.com/track?tracknum=${trackingNumber}`,
      'usps': `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`,
      'dhl': `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`,
    };
    return urls[carrier.toLowerCase()] || '';
  }

  trackByItem(_index: number, item: OrderItem): string {
    return item.id;
  }

  trackByStep(index: number, _step: TrackingStep): number {
    return index;
  }
}
