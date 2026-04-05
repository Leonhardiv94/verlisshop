import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Auth } from './auth';

export interface Product {
  _id?: string;
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

  // Publico
  getProducts(categoria?: string, subcategoria?: string): Observable<Product[]> {
    let params = '';
    if (categoria) params += `?categoria=${encodeURIComponent(categoria)}`;
    if (subcategoria) params += params ? `&subcategoria=${encodeURIComponent(subcategoria)}` : `?subcategoria=${encodeURIComponent(subcategoria)}`;
    
    return this.http.get<Product[]>(`${this.apiUrl}${params}`);
  }
}
