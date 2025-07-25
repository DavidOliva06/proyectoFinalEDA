import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  // Importamos los módulos que necesita la plantilla:
  // - CommonModule: para *ngIf
  // - RouterLink: para la directiva [routerLink]
  // - RouterLinkActive: para resaltar el enlace de la página actual
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  // Inyectamos los servicios que necesitamos
  private authService = inject(AuthService);
  private router = inject(Router);

  // Accedemos directamente al signal de solo lectura del servicio.
  // La plantilla reaccionará automáticamente a sus cambios.
  public isLoggedIn = this.authService.isLoggedIn;

  /**
   * Llama al método de logout del servicio y redirige al usuario.
   */
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
