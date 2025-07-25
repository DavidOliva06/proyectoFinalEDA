import { Component, EventEmitter, Output, input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Tree } from '../../core/services/tree.service';

@Component({
  selector: 'app-tree-list',
  standalone: true,
  imports: [CommonModule, DatePipe], // DatePipe para formatear fechas
  templateUrl: './tree-list.component.html',
  styleUrls: ['./tree-list.component.scss']
})
export class TreeListComponent {
  // --- Inputs y Outputs ---

  // Usamos el nuevo 'input' basado en signals.
  // Es obligatorio que el componente padre pase este dato.
  public trees = input.required<Tree[]>();

  // Eventos que se emiten hacia el componente padre.
  @Output() deleteTree = new EventEmitter<number>();
  @Output() loadTree = new EventEmitter<number>();

  /**
   * Emite el evento para eliminar un árbol.
   * @param id El ID del árbol a eliminar.
   */
  onDelete(id: number): void {
    this.deleteTree.emit(id);
  }

  /**
   * Emite el evento para cargar un árbol en el simulador.
   * @param id El ID del árbol a cargar.
   */
  onLoad(id: number): void {
    this.loadTree.emit(id);
  }

  // Función para optimizar el renderizado de la lista con *ngFor
  trackByTreeId(index: number, tree: Tree): number {
    return tree.id;
  }
}
