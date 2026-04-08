import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  _id: string;
  nombres: string;
  apellidos: string;
  cedula: string;
  correo: string;
  role: 'user' | 'admin';
  avatar?: string;
  pais?: string;
  ciudad?: string;
  direccion?: string;
  fechaNacimiento?: any;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `http://localhost:3000/api/users`;

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = localStorage.getItem('verlisshop_token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getUsers(query?: string): Observable<User[]> {
    const url = query ? `${this.apiUrl}?query=${query}` : this.apiUrl;
    return this.http.get<User[]>(url, { headers: this.getHeaders() });
  }

  createUser(userData: any): Observable<User> {
    return this.http.post<User>(this.apiUrl, userData, { headers: this.getHeaders() });
  }

  updateUser(id: string, userData: any): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, userData, { headers: this.getHeaders() });
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}
