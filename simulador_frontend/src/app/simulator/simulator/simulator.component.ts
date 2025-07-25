import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter, switchMap } from 'rxjs/operators';

import { Tree, TreeService, OperationPayload } from '../../core/services/tree.service';
import { ControlsComponent, CreateTreePayload } from '../controls/controls.component';
import { VisualizationComponent } from '../visualization/visualization.component';

@Component({
  selector: 'app-simulator',
  standalone: true,
  imports: [CommonModule, ControlsComponent, VisualizationComponent],
  templateUrl: './simulator.component.html',
  styleUrls: ['./simulator.component.scss']
})
export class SimulatorComponent implements OnInit {
  private treeService = inject(TreeService);
  private route = inject(ActivatedRoute);

  // --- Estado del Componente con Signals ---
  public activeTree = signal<Tree | null>(null);
  public isLoading = signal<boolean>(false);
  public message = signal<string | null>(null);

  ngOnInit(): void {
    // Escuchamos los parámetros de la URL para la función "Cargar Árbol".
    this.route.queryParams.pipe(
      // Nos aseguramos de que el parámetro 'loadTree' exista.
      filter(params => params['loadTree']),
      // Usamos switchMap para cambiar del observable de params al de la llamada HTTP.
      switchMap(params => {
        this.isLoading.set(true);
        this.message.set('Cargando árbol desde tu dashboard...');
        const treeId = Number(params['loadTree']);
        return this.treeService.getTreeById(treeId);
      })
    ).subscribe({
      next: (tree) => {
        this.activeTree.set(tree);
        this.isLoading.set(false);
        this.message.set(`Árbol "${tree.name}" cargado correctamente.`);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.message.set('Error al cargar el árbol seleccionado.');
        console.error(err);
      }
    });
  }

  /**
   * Maneja la creación de un nuevo árbol desde el componente de controles.
   */
  handleCreateTree(payload: CreateTreePayload): void {
    this.isLoading.set(true);
    this.message.set(`Creando nuevo árbol de tipo ${payload.type}...`);
    this.treeService.createTree(payload.name, payload.type).subscribe({
      next: (newTree) => {
        this.activeTree.set(newTree);
        this.isLoading.set(false);
        this.message.set(`Árbol "${newTree.name}" creado. ¡Ya puedes insertar nodos!`);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.message.set('No se pudo crear el árbol. ¿Has iniciado sesión?');
        console.error(err);
      }
    });
  }

  /**
   * Maneja una operación (insertar, borrar, etc.) en el árbol activo.
   */
  handleOperation(payload: OperationPayload): void {
    const currentTree = this.activeTree();
    if (!currentTree) {
      this.message.set('Error: no hay ningún árbol activo para realizar la operación.');
      return;
    }

    this.isLoading.set(true);
    this.message.set(`Ejecutando: ${payload.operation} ${payload.value}...`);

    this.treeService.performOperation(currentTree.id, payload).subscribe({
      next: (updatedTree) => {
        this.activeTree.set(updatedTree);
        this.isLoading.set(false);
        this.message.set(`Operación completada. Nodo: ${payload.value}.`);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.message.set(`Error en la operación: ${err.error?.error || 'Error desconocido'}`);
        console.error(err);
      }
    });
  }
}
