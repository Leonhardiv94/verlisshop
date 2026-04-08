import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService, CartItem } from '../../services/cart.service';
import { ModalService } from '../../services/modal.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.html',
  styleUrl: './cart.css'
})
export class Cart implements OnInit, OnDestroy {
  items: CartItem[] = [];
  totalAmount = 0;
  isOpen = false;
  private cartSub: Subscription = new Subscription();
  private modalSub: Subscription = new Subscription();

  constructor(
    private cartService: CartService,
    private modalService: ModalService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cartSub = this.cartService.cart$.subscribe(items => {
      this.items = items;
      this.totalAmount = this.cartService.getTotalAmount();
    });

    // We'll reuse ModalService to open the cart if needed, 
    // or just listen for a specific event. 
    // For now, let's use ModalService 'cart' type.
    this.modalSub = this.modalService.modal$.subscribe(type => {
      this.isOpen = (type === 'cart');
    });
  }

  ngOnDestroy() {
    this.cartSub.unsubscribe();
    this.modalSub.unsubscribe();
  }

  close() {
    this.modalService.close();
  }

  removeItem(item: CartItem) {
    this.cartService.removeItem(item.productId, item.size);
  }

  updateQty(item: CartItem, delta: number) {
    this.cartService.updateQuantity(item.productId, item.size, item.quantity + delta);
  }

  goToCheckout() {
    this.close();
    this.router.navigate(['/checkout'], { queryParams: { fromCart: true } });
  }

  keepShopping() {
    this.close();
    this.router.navigate(['/']);
  }
}
