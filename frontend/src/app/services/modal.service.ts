import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  openModalEvent = new EventEmitter<'login' | 'register'>();

  open(type: 'login' | 'register') {
    this.openModalEvent.emit(type);
  }
}
