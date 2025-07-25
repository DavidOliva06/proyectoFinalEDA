import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

// --- Interfaces para Tipado Fuerte ---

// Representa un objeto Árbol tal como lo devuelve tu TreeSerializer
export interface Tree {
  id: number;
  user: string;
  name: string;
  tree_type: 'AVL' | 'Splay' | 'B';
  structure: any; // El objeto JSON que representa la estructura del árbol
  created_at: string;
  updated_at: string;
}

// Representa el payload para el endpoint 'operate_on_tree'
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

  // URL base para el TreeViewSet
  private apiUrl = environment.apiUrl;

  /**
   * Crea las cabeceras de autenticación. Esencial para CADA llamada en este servicio.
   */
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getAuthToken();
    // Tu backend REQUIERE esto para cada endpoint en TreeViewSet
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }
   /**
   * Obtiene un único árbol por su ID.
   * Esencial para la función "Cargar desde Dashboard".
   * Llama a: GET /api/trees/{id}/
   * @param treeId El ID del árbol a recuperar.
   */
  getTreeById(treeId: number): Observable<Tree> {
    const headers = this.getAuthHeaders();
    return this.http.get<Tree>(`${this.apiUrl}/${treeId}/`, { headers });
  }

  /**
   * Obtiene la lista de árboles guardados para el usuario autenticado.
   * Llama a: GET /api/trees/
   */
  getSavedTrees(): Observable<Tree[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Tree[]>(this.apiUrl + '/', { headers });
  }

  /**
   * Crea un NUEVO registro de árbol en la base de datos.
   * Este es el primer paso antes de poder operar en un árbol.
   * Llama a: POST /api/trees/
   * @param name El nombre para el nuevo árbol.
   * @param type El tipo de árbol.
   * @returns Un Observable con el objeto del árbol recién creado.
   */
  createTree(name: string, type: 'AVL' | 'Splay' | 'B'): Observable<Tree> {
    const headers = this.getAuthHeaders();
    const payload = {
      name,
      tree_type: type,
      // La estructura inicial es un objeto vacío, tu lógica de backend lo manejará.
      structure: {} 
    };
    return this.http.post<Tree>(this.apiUrl + '/', payload, { headers });
  }

  /**
   * Realiza una operación (insertar, borrar, buscar) en un árbol EXISTENTE.
   * Llama a tu endpoint personalizado: POST /api/trees/{id}/operate/
   * @param treeId El ID del árbol sobre el que se va a operar.
   * @param payload La operación y el valor.
   * @returns Un Observable con el estado COMPLETO y actualizado del árbol.
   */
  performOperation(treeId: number, payload: OperationPayload): Observable<Tree> {
    const headers = this.getAuthHeaders();
    return this.http.post<Tree>(`${this.apiUrl}/${treeId}/operate/`, payload, { headers });
  }

  /**
   * Elimina un árbol guardado.
   * Llama a: DELETE /api/trees/{id}/
   * @param treeId El ID del árbol a eliminar.
   * @returns Un Observable (usualmente con una respuesta vacía en éxito).
   */
  deleteTree(treeId: number): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.delete<void>(`${this.apiUrl}/${treeId}/`, { headers });
  }
}
