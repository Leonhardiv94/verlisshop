import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService, Order } from '../../services/order.service';

@Component({
  selector: 'app-sales-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sales-history.html',
  styleUrl: './sales-history.css'
})
export class SalesHistory implements OnInit {
  orders: Order[] = [];
  isLoading = true;

  constructor(private orderService: OrderService) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.isLoading = true;
    this.orderService.getAllOrders().subscribe({
      next: (data) => {
        this.orders = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching all orders:', err);
        this.isLoading = false;
      }
    });
  }

  onStatusChange(orderId: string, newStatus: string) {
    this.orderService.updateOrderStatus(orderId, newStatus).subscribe({
      next: (updatedOrder: Order) => {
        // Update local state
        const index = this.orders.findIndex(o => o._id === orderId);
        if (index !== -1) {
          this.orders[index].estado = newStatus;
        }
      },
      error: (err: any) => {
        console.error('Error updating order status:', err);
        alert('No se pudo actualizar el estado del pedido.');
      }
    });
  }
}
