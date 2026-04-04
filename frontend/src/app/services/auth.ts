import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, BehaviorSubject } from 'rxjs';

interface AuthResponse {
  message: string;
  token: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private apiUrl = 'http://localhost:3000/api/auth';
  private tokenKey = 'verlisshop_token';
  private userKey = 'verlisshop_user';

  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  private currentUserSubject = new BehaviorSubject<any>(this.getStoredUser());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(correo: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { correo, password }).pipe(
      tap(res => {
        this.storeAuth(res.token, res.user);
      })
    );
  }

  register(userData: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData);
  }

  private getAuthHeaders() {
    return {
      headers: { Authorization: `Bearer ${this.getToken()}` }
    };
  }

  getProfile(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/profile`, this.getAuthHeaders());
  }

  updateGeneralInfo(data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/profile/general`, data, this.getAuthHeaders()).pipe(
      tap(res => {
        if(res.user) {
          localStorage.setItem(this.userKey, JSON.stringify(res.user));
          this.currentUserSubject.next(res.user);
        }
      })
    );
  }

  updatePhones(data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/profile/phones`, data, this.getAuthHeaders()).pipe(
      tap(res => {
        if(res.user) {
          localStorage.setItem(this.userKey, JSON.stringify(res.user));
          this.currentUserSubject.next(res.user);
        }
      })
    );
  }

  updateCredentials(data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/profile/credentials`, data, this.getAuthHeaders()).pipe(
      tap(res => {
        if(res.user) {
          localStorage.setItem(this.userKey, JSON.stringify(res.user));
          this.currentUserSubject.next(res.user);
        }
      })
    );
  }

  updateAvatar(data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/profile/avatar`, data, this.getAuthHeaders()).pipe(
      tap(res => {
        if(res.user) {
          localStorage.setItem(this.userKey, JSON.stringify(res.user));
          this.currentUserSubject.next(res.user);
        }
      })
    );
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.isLoggedInSubject.next(false);
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return this.hasToken();
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  private storeAuth(token: string, user: any) {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.isLoggedInSubject.next(true);
    this.currentUserSubject.next(user);
  }

  private getStoredUser(): any {
    const user = localStorage.getItem(this.userKey);
    return user ? JSON.parse(user) : null;
  }
}
