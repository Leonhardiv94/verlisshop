import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ModalType = 'login' | 'register' | 'cart' | null;

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modalSubject = new BehaviorSubject<ModalType>(null);
  modal$ = this.modalSubject.asObservable();

  open(type: ModalType) {
    this.modalSubject.next(type);
  }

  close() {
    this.modalSubject.next(null);
  }
}
