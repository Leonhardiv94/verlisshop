import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Auth } from './auth';

export interface Product {
  _id?: string;
  codigo?: number;
  nombre: string;
  precio: number;
  categoria: string;
  subcategoria: string;
  genero?: string;
  material: string;
  descripcion: string;
  fotoPrincipal: string; // Base64
  fotosAdicionales: string[]; // Base64[]
  tallas: string[];
  inventario?: Array<{
    talla: string;
    cantidad: number;
    _id?: string;
  }>;
  
  // Reviews
  reviews?: Array<{
    _id?: string;
    user: string;
    userName: string;
    userAvatar: string;
    rating: number;
    comment: string;
    reply?: string;
    adminName?: string;
    createdAt: Date;
  }>;
  averageRating?: number;

  // UI State para el carrusel
  _currentIndex?: number;
  _intervalId?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:3000/api/products';

  constructor(private http: HttpClient, private authService: Auth) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Admin solo
  createProduct(product: Product): Observable<any> {
    return this.http.post(this.apiUrl, product, { headers: this.getHeaders() });
  }

  // Publico general + busquedas del admin
  getProducts(categoria?: string, subcategoria?: string, search?: string): Observable<Product[]> {
    let params = '';
    const queryParts = [];
    if (categoria) queryParts.push(`categoria=${encodeURIComponent(categoria)}`);
    if (subcategoria) queryParts.push(`subcategoria=${encodeURIComponent(subcategoria)}`);
    if (search) queryParts.push(`search=${encodeURIComponent(search)}`);
    
    if (queryParts.length > 0) {
      params = '?' + queryParts.join('&');
    }
    
    return this.http.get<Product[]>(`${this.apiUrl}${params}`);
  }

  getProduct(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  // Admin editar
  updateProduct(id: string, product: Partial<Product>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, product, { headers: this.getHeaders() });
  }

  // Admin eliminar
  deleteProduct(id: string, password: string): Observable<any> {
    return this.http.request('delete', `${this.apiUrl}/${id}`, {
      body: { password },
      headers: this.getHeaders()
    });
  }

  // Reviews
  addReview(productId: string, review: { rating: number, comment: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/${productId}/review`, review, { headers: this.getHeaders() });
  }

  updateReview(productId: string, reviewId: string, comment: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${productId}/review/${reviewId}`, { comment }, { headers: this.getHeaders() });
  }

  replyReview(productId: string, reviewId: string, reply: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${productId}/reply/${reviewId}`, { reply }, { headers: this.getHeaders() });
  }

  updateInventory(productId: string, inventario: any[]): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${productId}/inventory`, { inventario }, { headers: this.getHeaders() });
  }
}
