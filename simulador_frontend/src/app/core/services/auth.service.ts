import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// --- INTERFACES CORREGIDAS ---

// Interfaz para la respuesta del endpoint /api/login/ de tu backend
export interface AuthTokenResponse {
  token: string;
}

// Interfaz para los datos de registro (esta no cambia)
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
  private apiUrl = environment.apiUrl;

  private readonly _isLoggedIn = signal<boolean>(!!localStorage.getItem('authToken'));
  public readonly isLoggedIn = this._isLoggedIn.asReadonly();

  /**
   * Envía las credenciales al endpoint de autenticación por Token de DRF.
   * @param credentials Un objeto con `username` y `password`.
   */
  login(credentials: any): Observable<AuthTokenResponse> {
    // CAMBIO 1: Apunta al endpoint correcto de tu urls.py
    return this.http.post<AuthTokenResponse>(`${this.apiUrl}/login/`, credentials).pipe(
      tap(response => {
        // CAMBIO 2: Guarda el valor del campo 'token' que devuelve tu backend
        localStorage.setItem('authToken', response.token);
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
   * Registra un nuevo usuario.
   * @param userData Un objeto con los datos del nuevo usuario.
   */
  register(userData: RegistrationData): Observable<any> {
    return this.http.post(`${this.apiUrl}/register/`, userData);
  }

  /**
   * Obtiene el token de autenticación guardado.
   * @returns El token o null si no existe.
   */
  getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }
}