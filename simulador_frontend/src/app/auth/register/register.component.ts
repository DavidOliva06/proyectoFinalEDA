import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AuthService, RegistrationData } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './register.component.html',
  styleUrls: ['../login/login.component.scss']
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  // --- Estado del Componente con Signals ---
  public isLoading = signal<boolean>(false);
  public errorMessage = signal<string | null>(null);

  // --- Definición del Formulario Reactivo ---
  public registerForm: FormGroup;

  constructor() {
    this.registerForm = this.fb.group({
      // Tu backend espera 'username', 'email' y 'password'.
      username: ['', [Validators.required, Validators.minLength(4)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  /**
   * Método que se ejecuta al enviar el formulario.
   */
  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    // 1. Preparamos el estado para la petición
    this.isLoading.set(true);
    this.errorMessage.set(null);

    // 2. Extraemos los datos del formulario
    const userData: RegistrationData = this.registerForm.getRawValue();

    // 3. Llamamos al servicio de autenticación
    this.authService.register(userData).subscribe({
      next: () => {
        // Si el registro es exitoso:
        // Redirigimos al usuario a la página de login con un mensaje de éxito.
        // Podríamos pasar el mensaje a través de queryParams o un servicio de estado.
        // Por simplicidad, solo redirigimos.
        this.router.navigate(['/auth/login']);
        // Podríamos mostrar un "Toast" o notificación de "Registro exitoso".
      },
      error: (err) => {
        this.isLoading.set(false);
        // Manejamos errores específicos del backend (ej. usuario ya existe)
        if (err.status === 400 && err.error) {
          // Extraemos los mensajes de error del backend de Django REST Framework
          const errors = err.error;
          if (errors.username) {
            this.errorMessage.set(`Usuario: ${errors.username[0]}`);
          } else if (errors.email) {
            this.errorMessage.set(`Email: ${errors.email[0]}`);
          } else {
            this.errorMessage.set('Los datos proporcionados son inválidos.');
          }
        } else {
          this.errorMessage.set('Ocurrió un error inesperado al registrar la cuenta.');
        }
        console.error(err);
      }
    });
  }
}
