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

  // Rating Modal
  showRatingModal = false;
  selectedOrderForRating: Order | null = null;
  ratingStars = 0;
  ratingComment = '';

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

  openRatingModal(order: Order) {
    this.selectedOrderForRating = order;
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

  saveRating() {
    if (!this.selectedOrderForRating || !this.selectedOrderForRating.product) return;
    
    const reviewData = {
      rating: this.ratingStars,
      comment: this.ratingComment
    };

    const productId = this.selectedOrderForRating.product;

    this.productService.addReview(productId, reviewData).subscribe({
      next: (res) => {
        alert('¡Gracias por tu calificación!');
        this.closeRatingModal();
        // Opcional: marcar la orden como calificada localmente si agregas un campo en el modelo
      },
      error: (err) => {
        console.error('Error saving rating:', err);
        alert('No se pudo guardar la calificación.');
      }
    });
  }
}
