import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { Tree, TreeService } from '../../core/services/tree.service';
import { TreeListComponent } from '../tree-list/tree-list.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  // Importamos el componente hijo que vamos a usar en la plantilla.
  imports: [CommonModule, TreeListComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  // Inyección de dependencias
  private treeService = inject(TreeService);
  private router = inject(Router);

  // --- Estado del Componente con Signals ---
  public savedTrees = signal<Tree[]>([]);
  public isLoading = signal<boolean>(true);
  public errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    // Cuando el componente se inicializa, cargamos los árboles guardados.
    this.loadSavedTrees();
  }

  /**
   * Obtiene los árboles del usuario desde el backend.
   */
  loadSavedTrees(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.treeService.getSavedTrees().subscribe({
      next: (trees) => {
        this.savedTrees.set(trees);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set('No se pudieron cargar tus árboles. Por favor, intenta de nuevo.');
        this.isLoading.set(false);
        console.error(err);
      }
    });
  }

  /**
   * Maneja el evento de eliminación emitido por el componente hijo.
   * @param treeId El ID del árbol a eliminar.
   */
  handleDeleteTree(treeId: number): void {
    // Opcional: Añadir una confirmación antes de borrar.
    if (!confirm('¿Estás seguro de que quieres eliminar este árbol de forma permanente?')) {
      return;
    }
    
    this.treeService.deleteTree(treeId).subscribe({
      next: () => {
        // Si la eliminación en el backend fue exitosa, actualizamos nuestro estado local.
        // El método .update() de un signal es perfecto para esto.
        this.savedTrees.update(currentTrees => 
          currentTrees.filter(tree => tree.id !== treeId)
        );
        // Opcional: Mostrar una notificación de éxito.
      },
      error: (err) => {
        // Mostrar un error si la eliminación falla.
        alert('Error al eliminar el árbol.');
        console.error(err);
      }
    });
  }

  /**
   * Maneja el evento de carga emitido por el componente hijo.
   * @param treeId El ID del árbol que se cargará en el simulador.
   */
  handleLoadTree(treeId: number): void {
    // Navegamos al simulador y pasamos el ID del árbol como un query parameter.
    // El simulador tendrá que ser modificado para leer este parámetro.
    this.router.navigate(['/simulator'], { queryParams: { loadTree: treeId } });
  }
}
