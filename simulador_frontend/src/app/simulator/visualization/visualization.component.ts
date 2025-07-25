import { Component, ElementRef, ViewChild, effect, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Tree } from '../../core/services/tree.service';
// import * as n3 from 'n3';

@Component({
  selector: 'app-visualization',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './visualization.component.html',
  styleUrls: ['./visualization.component.scss']
})
export class VisualizationComponent {
  // Recibe el objeto Tree completo.
  public tree = input.required<Tree>();
  @ViewChild('treeContainer') container!: ElementRef<HTMLDivElement>;

  constructor() {
    // El effect reacciona cuando el objeto 'tree' cambia.
    effect(() => {
      const treeData = this.tree(); // Obtenemos el valor del signal
      if (this.container && treeData?.structure) {
        this.renderTree(treeData.structure);
      }
    });
  }

  private renderTree(structure: any): void {
    if (!this.container) return;
    this.container.nativeElement.innerHTML = ''; // Limpiar lienzo

    // --- AQUÍ VA LA LÓGICA DE N3.JS ---
    // Usarías 'structure' como los datos para la librería.
    const placeholder = document.createElement('pre');
    placeholder.textContent = JSON.stringify(structure, null, 2);
    this.container.nativeElement.appendChild(placeholder);
  }
}
