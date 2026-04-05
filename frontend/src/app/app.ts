import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { Sidebar } from './components/sidebar/sidebar';
import { Footer } from './components/footer/footer';
import { AuthModal } from './components/auth-modal/auth-modal';
import { ModalService } from './services/modal.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Sidebar, Footer, AuthModal],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  showModal = false;
  modalType: 'login' | 'register' = 'login';
  private modalSub: Subscription = new Subscription();

  constructor(private modalService: ModalService) {}

  ngOnInit() {
    this.modalSub.add(
      this.modalService.openModalEvent.subscribe((type) => {
        this.openModal(type);
      })
    );
  }

  ngOnDestroy() {
    this.modalSub.unsubscribe();
  }

  openModal(type: 'login' | 'register') {
    this.modalType = type;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }
}
