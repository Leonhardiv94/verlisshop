import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { Sidebar } from './components/sidebar/sidebar';
import { Footer } from './components/footer/footer';
import { AuthModal } from './components/auth-modal/auth-modal';
import { Cart } from './components/cart/cart';
import { ModalService, ModalType } from './services/modal.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Sidebar, Footer, AuthModal, Cart],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  showAuthModal = false;
  modalType: 'login' | 'register' = 'login';
  private modalSub: Subscription = new Subscription();

  constructor(private modalService: ModalService) {}

  ngOnInit() {
    this.modalSub = this.modalService.modal$.subscribe((type) => {
      if (type === 'login' || type === 'register') {
        this.modalType = type;
        this.showAuthModal = true;
      } else if (type === null) {
        this.showAuthModal = false;
      }
    });
  }

  ngOnDestroy() {
    this.modalSub.unsubscribe();
  }

  closeModal() {
    this.modalService.close();
  }
}
