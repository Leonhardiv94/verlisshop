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
}
