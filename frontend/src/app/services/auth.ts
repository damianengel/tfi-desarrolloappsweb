import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { LoginResponse, RolesUsuarios, Usuario } from '../models/usuario';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api/auth';
  private currentUserSubject = new BehaviorSubject<Usuario | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    try {
      const savedUser = localStorage.getItem('usuario');
      if (savedUser && localStorage.getItem('access_token')) {
        this.currentUserSubject.next(JSON.parse(savedUser) as Usuario);
      } else {
        this.logout();
      }
    } catch {
      this.logout();
    }
  }

  login(email: string, clave: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, clave }).pipe(
      tap(res => {
        localStorage.setItem('access_token', res.access_token);
        localStorage.setItem('usuario', JSON.stringify(res.usuario));
        this.currentUserSubject.next(res.usuario);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('usuario');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    try {
      return localStorage.getItem('access_token');
    } catch {
      return null;
    }
  }

  get currentUserValue(): Usuario | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  hasRole(role: RolesUsuarios): boolean {
    const user = this.currentUserValue;
    return user ? user.rol === role : false;
  }
}
