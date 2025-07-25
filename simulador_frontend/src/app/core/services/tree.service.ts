import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

// --- INTERFACES (no cambian) ---

export interface Tree {
  id: number;
  user: string;
  name: string;
  tree_type: 'AVL' | 'Splay' | 'B';
  structure: any;
  created_at: string;
  updated_at: string;
}

export interface OperationPayload {
  operation: 'insert' | 'delete' | 'search';
  value: number;
}

@Injectable({
  providedIn: 'root'
})
export class TreeService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  // URL base para el TreeViewSet, se le quita la parte final para construirla en cada método
  private apiUrl = environment.apiUrl;

  /**
   * Crea las cabeceras HTTP necesarias para las peticiones autenticadas.
   */
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getAuthToken();
    if (!token) {
      return new HttpHeaders();
    }
    // CAMBIO 3: Usa el prefijo 'Token' que espera DRF, en lugar de 'Bearer'.
    return new HttpHeaders().set('Authorization', `Token ${token}`);
  }

  /**
   * Obtiene la lista de árboles guardados por el usuario autenticado.
   */
  getSavedTrees(): Observable<Tree[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Tree[]>(`${this.apiUrl}/trees/`, { headers });
  }

  /**
   * Crea un NUEVO registro de árbol en la base de datos.
   */
  createTree(name: string, type: 'AVL' | 'Splay' | 'B'): Observable<Tree> {
    const headers = this.getAuthHeaders();
    const payload = {
      name,
      tree_type: type,
      structure: {} 
    };
    return this.http.post<Tree>(`${this.apiUrl}/trees/`, payload, { headers });
  }

  /**
   * Realiza una operación en un árbol EXISTENTE.
   */
  performOperation(treeId: number, payload: OperationPayload): Observable<Tree> {
    const headers = this.getAuthHeaders();
    return this.http.post<Tree>(`${this.apiUrl}/trees/${treeId}/operate/`, payload, { headers });
  }

  /**
   * Obtiene un único árbol por su ID.
   */
  getTreeById(treeId: number): Observable<Tree> {
    const headers = this.getAuthHeaders();
    return this.http.get<Tree>(`${this.apiUrl}/trees/${treeId}/`, { headers });
  }

  /**
   * Elimina un árbol guardado.
   */
  deleteTree(treeId: number): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.delete<void>(`${this.apiUrl}/trees/${treeId}/`, { headers });
  }
}
