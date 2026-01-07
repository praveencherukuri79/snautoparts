import { Component, inject, signal, OnInit, input } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonComponent } from '@shared/primitives/button/button.component';
import { CardComponent } from '@shared/primitives/card/card.component';
import { SpinnerComponent } from '@shared/primitives/spinner/spinner.component';
import { OrderService } from '@core/services';
import { Order } from '@core/models';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [CommonModule, RouterModule, CurrencyPipe, ButtonComponent, CardComponent, SpinnerComponent],
  templateUrl: './confirmation.component.html',
  styleUrl: './confirmation.component.scss',
})
export class ConfirmationComponent implements OnInit {
  private orderService = inject(OrderService);

  orderId = input.required<string>();
  
  order = signal<Order | null>(null);
  isLoading = signal(true);

  async ngOnInit(): Promise<void> {
    try {
      const order = await this.orderService.getOrder(this.orderId());
      this.order.set(order);
    } finally {
      this.isLoading.set(false);
    }
  }
}

