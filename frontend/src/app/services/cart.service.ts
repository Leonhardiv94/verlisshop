import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems: CartItem[] = [];
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  cart$ = this.cartSubject.asObservable();

  constructor() {
    this.loadCart();
  }

  private saveCart() {
    localStorage.setItem('virver_cart', JSON.stringify(this.cartItems));
    this.cartSubject.next([...this.cartItems]);
  }

  private loadCart() {
    const saved = localStorage.getItem('virver_cart');
    if (saved) {
      this.cartItems = JSON.parse(saved);
      this.cartSubject.next([...this.cartItems]);
    }
  }

  addItem(item: CartItem) {
    const existing = this.cartItems.find(i => i.productId === item.productId && i.size === item.size);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      this.cartItems.push(item);
    }
    this.saveCart();
  }

  removeItem(productId: string, size?: string) {
    this.cartItems = this.cartItems.filter(i => !(i.productId === productId && i.size === size));
    this.saveCart();
  }

  updateQuantity(productId: string, size: string | undefined, quantity: number) {
    const item = this.cartItems.find(i => i.productId === productId && i.size === size);
    if (item) {
      item.quantity = quantity;
      if (item.quantity <= 0) {
        this.removeItem(productId, size);
      } else {
        this.saveCart();
      }
    }
  }

  getCartSnapshot() {
    return [...this.cartItems];
  }

  clearCart() {
    this.cartItems = [];
    this.saveCart();
  }

  getTotalItems() {
    return this.cartItems.reduce((acc, item) => acc + item.quantity, 0);
  }

  getTotalAmount() {
    return this.cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }
}
