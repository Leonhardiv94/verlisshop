import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { Auth } from '../../services/auth';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

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
  private authSub: Subscription = new Subscription();

  constructor(private authService: Auth, private router: Router) {}

  ngOnInit() {
    this.authSub.add(
      this.authService.isLoggedIn$.subscribe(status => this.isLoggedIn = status)
    );
    this.authSub.add(
      this.authService.currentUser$.subscribe(user => this.currentUser = user)
    );
  }

  ngOnDestroy() {
    this.authSub.unsubscribe();
  }

  onLogin() {
    this.openModalEvent.emit('login');
  }

  onRegister() {
    this.openModalEvent.emit('register');
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
