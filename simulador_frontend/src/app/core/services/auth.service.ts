import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../../enviroments/environment';

// Interfaz para la respuesta del token de Simple JWT
export interface TokenResponse {
  access: string;
  refresh: string;
}

// Interfaz para los datos de registro, coincide con tu UserRegistrationSerializer
export interface RegistrationData {
  username: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  
  // URL de tu API en Vercel. ¡Confirmado!
  private apiUrl = environment.apiUrl;

  private readonly _isLoggedIn = signal<boolean>(!!localStorage.getItem('authToken'));
  public readonly isLoggedIn = this._isLoggedIn.asReadonly();

  /**
   * Inicia sesión llamando al endpoint de token de Simple JWT.
   */
  login(credentials: any): Observable<TokenResponse> {
    // Este endpoint es proporcionado por Simple JWT, no está en tu views.py, lo cual es normal.
    return this.http.post<TokenResponse>(`${this.apiUrl}/token/`, credentials).pipe(
      tap(response => {
        localStorage.setItem('authToken', response.access);
        this._isLoggedIn.set(true);
      })
    );
  }

  /**
   * Cierra la sesión del usuario.
   */
  logout(): void {
    localStorage.removeItem('authToken');
    this._isLoggedIn.set(false);
  }

  /**
   * Registra un nuevo usuario llamando a tu UserRegistrationView.
   */
  register(userData: RegistrationData): Observable<any> {
    // Este endpoint coincide con tu UserRegistrationView.
    return this.http.post(`${this.apiUrl}/register/`, userData);
  }

  /**
   * Obtiene el token de autenticación para ser usado en otros servicios.
   */
  getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }
}