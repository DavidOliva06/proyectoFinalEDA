import { Component, EventEmitter, Output, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { OperationPayload } from '../../core/services/tree.service';

// Definimos los tipos de datos que este componente emite.
export type CreateTreePayload = { name: string; type: 'AVL' | 'Splay' | 'B'; };

@Component({
  selector: 'app-controls',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './controls.component.html',
  styleUrls: ['./controls.component.scss']
})
export class ControlsComponent {
  // --- Inputs y Outputs ---
  public isSessionActive = input<boolean>(false);
  @Output() createTree = new EventEmitter<CreateTreePayload>();
  @Output() operation = new EventEmitter<OperationPayload>();

  // --- Estado Interno para los Formularios ---
  // Para la creación
  public newTreeName = '';
  public newTreeType: 'AVL' | 'Splay' | 'B' = 'AVL';
  // Para las operaciones
  public nodeValue: number | null = null;

  onCreate(): void {
    if (this.newTreeName && this.newTreeType) {
      this.createTree.emit({ name: this.newTreeName, type: this.newTreeType });
    }
  }

  onPerformOperation(type: 'insert' | 'delete' | 'search'): void {
    if (this.nodeValue !== null) {
      this.operation.emit({ operation: type, value: this.nodeValue });
      this.nodeValue = null; // Limpiar el campo tras la operación
    }
  }
}
