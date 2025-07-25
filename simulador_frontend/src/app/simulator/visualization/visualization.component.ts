import { Component, ElementRef, ViewChild, effect, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Tree } from '../../core/services/tree.service';

import * as d3 from 'd3';

// La estructura de datos que D3 espera.
// ¡Tu backend ya la provee en `structure`!
interface D3Node {
  name: string; // Tu backend envía el nombre con la altura, ej. "12 (h:2)"
  original_name: string | number; // Usaremos esto para el resaltado
  children?: D3Node[];
}

@Component({
  selector: 'app-visualization',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './visualization.component.html',
  styleUrls: ['./visualization.component.scss']
})
export class VisualizationComponent {
  public tree = input.required<Tree>();
  @ViewChild('treeContainer') container!: ElementRef<HTMLDivElement>;

  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined> | undefined;

  constructor() {
    effect(() => {
      const treeData = this.tree();
      
      // 1. Verificamos que tenemos los datos y el contenedor
      if (this.container && treeData?.structure) {
        
        // 2. Comprobamos si el árbol está vacío (un objeto {} sin propiedades)
        if (Object.keys(treeData.structure).length === 0) {
          this.clearTree();
          this.container.nativeElement.innerHTML = '<p class="empty-tree-msg">El árbol está vacío. ¡Inserta un nodo!</p>';
        } else {
          // 3. ¡No necesitamos transformar! Pasamos la estructura directamente.
          this.renderTree(treeData.structure, treeData.structure.highlight_key);
        }
      }
    });
  }

  private clearTree(): void {
    if (this.svg) {
      this.svg.remove();
      this.svg = undefined;
    }
  }

  /**
   * Renderiza el árbol en el contenedor usando D3.js.
   * Ahora recibe directamente la estructura del backend.
   */
  private renderTree(data: D3Node, highlightKey?: number | null): void {
    this.clearTree();
    this.container.nativeElement.innerHTML = '';

    const width = this.container.nativeElement.offsetWidth;
    const height = 600;
    const margin = { top: 50, right: 12, bottom: 50, left: 12 }; // Ajustamos márgenes

    const treeLayout = d3.tree<D3Node>().size([width - margin.left - margin.right, height - margin.top - margin.bottom]);
    const root = d3.hierarchy(data);
    treeLayout(root);

    this.svg = d3.select(this.container.nativeElement)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    const g = this.svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Dibuja los enlaces
    g.selectAll('.link')
      .data(root.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', d3.linkVertical<any, d3.HierarchyPointNode<D3Node>>()
        .x(d => d.x!)
        .y(d => d.y!)
      );

    // Dibuja los nodos
    const node = g.selectAll('.node')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x},${d.y})`);

    // Círculo del nodo
    node.append('circle')
      .attr('r', 25) // Un poco más grande para que quepa el texto
      // Usamos 'original_name' para la lógica de resaltado
      .style('fill', d => d.data.original_name === highlightKey ? '#ffc107' : '#007bff');

    // Texto del nodo
    node.append('text')
      .attr('dy', '0.31em')
      // Mostramos el 'name' que incluye la altura
      .text(d => d.data.name);
  }
}
