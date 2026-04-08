import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Auth } from './auth';

export interface Order {
  _id: string;
  user: any; // ID or populated Object
  productSnapshot: {
    nombre: string;
    fotoPrincipal: string;
    precio: number;
    codigo: number;
  };
  tallaEscogida: string;
  cantidad: number;
  direccionEnvio: {
    pais: string;
    ciudad: string;
    direccion: string;
    referencia: string;
  };
  costoEnvio: number;
  totalPagar: number;
  estado: string;
  codigoOrden: string;
  createdAt: string;
  historialEstados: { estado: string, fecha: string }[];
  _showHistory?: boolean; // UI ONLY
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:3000/api/orders';

  constructor(private http: HttpClient, private authService: Auth) { }

  private getAuthHeaders() {
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.authService.getToken()}`
      })
    };
  }

  createOrder(orderData: any): Observable<{ message: string, order: Order }> {
    return this.http.post<{ message: string, order: Order }>(this.apiUrl, orderData, this.getAuthHeaders());
  }

  getMyOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/me`, this.getAuthHeaders());
  }

  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl, this.getAuthHeaders());
  }

  updateOrderStatus(orderId: string, status: string): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${orderId}/status`, { status }, this.getAuthHeaders());
  }
}
