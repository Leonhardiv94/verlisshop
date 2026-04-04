import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { Sidebar } from './components/sidebar/sidebar';
import { Footer } from './components/footer/footer';
import { AuthModal } from './components/auth-modal/auth-modal';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Sidebar, Footer, AuthModal],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  showModal = false;
  modalType: 'login' | 'register' = 'login';

  openModal(type: 'login' | 'register') {
    this.modalType = type;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }
}
