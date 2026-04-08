import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { Auth } from '../../services/auth';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ModalService } from '../../services/modal.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit, OnDestroy {
  @Output() openModalEvent = new EventEmitter<'login' | 'register'>();

  isLoggedIn = false;
  currentUser: any = null;
  showLogoutModal = false;
  cartItemCount = 0;
  private authSub: Subscription = new Subscription();
  private cartSub: Subscription = new Subscription();

  constructor(
    private authService: Auth, 
    private router: Router,
    private modalService: ModalService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    this.authSub.add(
      this.authService.isLoggedIn$.subscribe(status => this.isLoggedIn = status)
    );
    this.authSub.add(
      this.authService.currentUser$.subscribe(user => this.currentUser = user)
    );

    this.cartSub = this.cartService.cart$.subscribe(() => {
      this.cartItemCount = this.cartService.getTotalItems();
    });
  }

  ngOnDestroy() {
    this.authSub.unsubscribe();
    this.cartSub.unsubscribe();
  }

  onLogin() {
    this.modalService.open('login');
  }

  onRegister() {
    this.modalService.open('register');
  }

  openCart() {
    this.modalService.open('cart');
  }

  onLogout() {
    this.showLogoutModal = true;
  }

  confirmLogout() {
    this.showLogoutModal = false;
    this.authService.logout();
    this.router.navigate(['/'], { replaceUrl: true });
  }

  cancelLogout() {
    this.showLogoutModal = false;
  }

  navigateToProfile() {
    this.router.navigate(['/profile']);
  }

  navigateToHelp() {
    this.router.navigate(['/help']);
  }

  navigateToHome() {
    this.router.navigate(['/']);
  }

  navigateToMyOrders() {
    this.router.navigate(['/mis-compras']);
  }
}
