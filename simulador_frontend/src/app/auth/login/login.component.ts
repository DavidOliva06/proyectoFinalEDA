import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  // Importamos los módulos y componentes que necesita nuestra plantilla.
  imports: [
    CommonModule,          // Para directivas como *ngIf
    ReactiveFormsModule,   // Para trabajar con [formGroup]
    RouterLink,            // Para la directiva routerLink
  ],
  templateUrl: './login.component.component.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  // Inyección de dependencias moderna
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  // --- Estado del Componente con Signals ---
  // Signal para gestionar el estado de carga y deshabilitar el botón
  public isLoading = signal<boolean>(false);
  // Signal para mostrar un mensaje de error en la plantilla
  public errorMessage = signal<string | null>(null);

  // --- Definición del Formulario Reactivo ---
  public loginForm: FormGroup;

  constructor() {
    // Creamos el formulario reactivo en el constructor.
    this.loginForm = this.fb.group({
      // El primer valor es el inicial, el segundo es un array de validadores.
      // Tu backend espera 'username', no 'email', para el login.
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  /**
   * Método que se ejecuta al enviar el formulario.
   */
  onSubmit(): void {
    // Si el formulario no es válido, no hacemos nada.
    if (this.loginForm.invalid) {
      return;
    }

    // 1. Preparamos el estado para la petición
    this.isLoading.set(true);
    this.errorMessage.set(null);

    // 2. Extraemos los valores del formulario
    const credentials = this.loginForm.getRawValue();

    // 3. Llamamos al servicio de autenticación
    this.authService.login(credentials).subscribe({
      next: () => {
        // Si la petición es exitosa:
        // Redirigimos al usuario al dashboard.
        this.router.navigate(['/dashboard']);
        // El estado de carga se quita implícitamente al salir de la página,
        // pero es buena práctica resetearlo.
        this.isLoading.set(false);
      },
      error: (err) => {
        // Si la petición falla:
        // Actualizamos los signals para mostrar el error y reactivar el botón.
        this.isLoading.set(false);
        if (err.status === 401) {
          this.errorMessage.set('Nombre de usuario o contraseña incorrectos.');
        } else {
          this.errorMessage.set('Ocurrió un error inesperado. Por favor, inténtalo de nuevo.');
        }
        console.error(err); // Es importante loguear el error completo para depuración.
      }
    });
  }
}
