import { Component, ElementRef, ViewChild, effect, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Tree } from '../../core/services/tree.service';

// Solo importamos D3. ¡Adiós n3-charts!
import * as d3 from 'd3';

// La estructura de datos que D3 espera (es la misma que usábamos antes)
interface D3Node {
  name: string | number;
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

  // Creamos el SVG una sola vez para mejorar el rendimiento
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined> | undefined;
  private g: d3.Selection<SVGGElement, unknown, null, undefined> | undefined;

  constructor() {
    effect(() => {
      const treeData = this.tree();
      if (this.container && treeData?.structure) {
        const d3FormattedData = this.transformDataForD3(treeData.structure);
        if (d3FormattedData) {
          this.renderTree(d3FormattedData, treeData.structure.highlight_key);
        } else {
          this.clearTree();
          this.container.nativeElement.innerHTML = '<p class="empty-tree-msg">El árbol está vacío. ¡Inserta un nodo!</p>';
        }
      }
    });
  }

  /**
   * Transforma el JSON de nuestro backend a la estructura que D3 necesita.
   */
  private transformDataForD3(backendNode: any): D3Node | null {
    if (!backendNode || backendNode.value === null || backendNode.value === undefined) {
      return null;
    }
    const d3Node: D3Node = { name: backendNode.value, children: [] };
    if (backendNode.left) {
      const leftChild = this.transformDataForD3(backendNode.left);
      if (leftChild) d3Node.children?.push(leftChild);
    }
    if (backendNode.right) {
      const rightChild = this.transformDataForD3(backendNode.right);
      if (rightChild) d3Node.children?.push(rightChild);
    }
    if (d3Node.children?.length === 0) {
      delete d3Node.children;
    }
    return d3Node;
  }

  private clearTree(): void {
    if (this.svg) {
      this.svg.remove();
      this.svg = undefined;
    }
  }

  /**
   * Renderiza el árbol en el contenedor usando D3.js.
   */
  private renderTree(data: D3Node, highlightKey?: number | null): void {
    this.clearTree(); // Limpiamos cualquier dibujo anterior
    this.container.nativeElement.innerHTML = ''; // Limpiamos el mensaje de "árbol vacío"

    const width = this.container.nativeElement.offsetWidth;
    const height = 600;
    const margin = { top: 50, right: 50, bottom: 50, left: 50 };

    // 1. Creamos el generador de layout de árbol
    const treeLayout = d3.tree<D3Node>().size([width - margin.left - margin.right, height - margin.top - margin.bottom]);
    
    // 2. Procesamos los datos para darles estructura jerárquica
    const root = d3.hierarchy(data);
    
    // 3. Calculamos las posiciones de los nodos
    treeLayout(root);

    // 4. Creamos el SVG y el grupo principal
    this.svg = d3.select(this.container.nativeElement)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    this.g = this.svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // 5. Dibujamos los enlaces (líneas)
    this.g.selectAll('.link')
      .data(root.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', d3.linkVertical<any, d3.HierarchyPointNode<D3Node>>()
        .x(d => d.x!)
        .y(d => d.y!)
      );

    // 6. Dibujamos los nodos (círculos y texto)
    const node = this.g.selectAll('.node')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x},${d.y})`);

    // Círculo del nodo
    node.append('circle')
      .attr('r', 20)
      .style('fill', d => d.data.name === highlightKey ? '#ffc107' : '#007bff'); // Resaltado

    // Texto del nodo
    node.append('text')
      .attr('dy', '0.31em')
      .text(d => d.data.name);
  }
}
