import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OrderService, Order } from '../../services/order.service';
import { ProductService } from '../../services/product.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-orders.html',
  styleUrl: './my-orders.css'
})
export class MyOrders implements OnInit {
  orders: Order[] = [];
  isLoading = true;

  // Notifications
  notification = { show: false, message: '', type: 'success' as 'success' | 'error' };

  // Rating Modal
  showRatingModal = false;
  selectedOrderForRating: Order | null = null;
  ratingStars = 0;
  ratingComment = '';
  selectedProductForRating: any = null;

  constructor(
    private orderService: OrderService, 
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit() {
    this.orderService.getMyOrders().subscribe({
      next: (data) => {
        this.orders = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching orders:', err);
        this.isLoading = false;
      }
    });
  }

  goShopping() {
    this.router.navigate(['/']);
  }

  toggleHistory(order: Order) {
    order._showHistory = !order._showHistory;
  }

  openRatingModal(order: Order, item?: any) {
    this.selectedOrderForRating = order;
    this.selectedProductForRating = item || order.items[0];
    this.ratingStars = 5;
    this.ratingComment = '';
    this.showRatingModal = true;
  }

  closeRatingModal() {
    this.showRatingModal = false;
    this.selectedOrderForRating = null;
  }

  setStars(n: number) {
    this.ratingStars = n;
  }

  private showNotification(message: string, type: 'success' | 'error') {
    this.notification = { show: true, message, type };
    setTimeout(() => {
      this.notification.show = false;
    }, 4000);
  }

  saveRating() {
    if (!this.selectedProductForRating) return;
    
    const reviewData = {
      rating: this.ratingStars,
      comment: this.ratingComment
    };

    const productId = this.selectedProductForRating.product;

    this.productService.addReview(productId, reviewData).subscribe({
      next: (res) => {
        this.showNotification('¡Gracias por tu calificación!', 'success');
        this.closeRatingModal();
        // Opcional: marcar la orden como calificada localmente si agregas un campo en el modelo
      },
      error: (err) => {
        console.error('Error saving rating:', err);
        this.showNotification('No se pudo guardar la calificación.', 'error');
      }
    });
  }
}
