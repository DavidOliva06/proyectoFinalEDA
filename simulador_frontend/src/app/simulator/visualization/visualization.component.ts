import { Component, ElementRef, ViewChild, effect, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Tree } from '../../core/services/tree.service';

// --- ¡NO HAY IMPORTS PARA D3 O N3 AQUÍ! ---
// TypeScript ahora sabe que existen gracias al archivo `typings.d.ts`

// --- INTERFACES ---

// La estructura de datos que n3.js espera
interface N3Node {
  name: string | number;
  children?: N3Node[];
}

// Nuestra definición de tipo aumentada para el nodo de D3 con estilos
interface N3HierarchyNode extends d3.HierarchyNode<N3Node> {
  style?: { [key: string]: any };
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

  constructor() {
    // El effect se dispara cada vez que el árbol cambia
    effect(() => {
      const treeData = this.tree();
      
      if (this.container && treeData?.structure) {
        // 1. Transformar datos
        const n3FormattedData = this.transformDataForN3(treeData.structure);
        
        // 2. Renderizar si hay datos
        if (n3FormattedData) {
          this.renderTree(n3FormattedData, treeData.structure.highlight_key);
        } else {
          this.container.nativeElement.innerHTML = '<p class="empty-tree-msg">El árbol está vacío. ¡Inserta un nodo!</p>';
        }
      }
    });
  }

  /**
   * Transforma el JSON de nuestro backend a la estructura que n3.js necesita.
   */
  private transformDataForN3(backendNode: any): N3Node | null {
    if (!backendNode || backendNode.value === null || backendNode.value === undefined) {
      return null;
    }

    const n3Node: N3Node = {
      name: backendNode.value,
      children: []
    };

    if (backendNode.left) {
      const leftChild = this.transformDataForN3(backendNode.left);
      if (leftChild) n3Node.children?.push(leftChild);
    }
    if (backendNode.right) {
      const rightChild = this.transformDataForN3(backendNode.right);
      if (rightChild) n3Node.children?.push(rightChild);
    }

    if (n3Node.children?.length === 0) {
      delete n3Node.children;
    }

    return n3Node;
  }

  /**
   * Renderiza el árbol en el contenedor usando las variables globales n3 y d3.
   */
  private renderTree(data: N3Node, highlightKey?: number | null): void {
    if (!this.container) return;
    this.container.nativeElement.innerHTML = '';

    // El código aquí es el mismo, pero ahora 'n3' y 'd3' se refieren a las
    // variables globales inyectadas por angular.json, no a módulos importados.
    const tree = new n3.Tree(data, {
      target: this.container.nativeElement,
      width: this.container.nativeElement.offsetWidth,
      height: 600,
      margin: { top: 40, right: 40, bottom: 40, left: 40 },
      nodeStyler: (node: N3HierarchyNode) => {
        if (!node.style) {
          node.style = {};
        }
        if (node.data.name === highlightKey) {
          node.style['fill'] = '#ffc107';
          node.style['stroke'] = '#e6a100';
        }
      },
    });

    tree.render();
  }
}
