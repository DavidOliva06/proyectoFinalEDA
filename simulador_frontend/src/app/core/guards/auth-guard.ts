import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Este es un Guard funcional de tipo CanActivate.
 * Su propósito es proteger rutas que requieren que el usuario esté autenticado.
 *
 * @param route La ruta que se intenta activar.
 * @param state El estado actual del router.
 * @returns {boolean | UrlTree} - `true` si la navegación está permitida,
 * o un `UrlTree` para redirigir al usuario si la navegación se deniega.
 */
export const authGuard: CanActivateFn = (route, state) => {

  // 1. Inyección de dependencias moderna:
  // Usamos `inject()` para obtener las instancias de nuestros servicios
  // directamente dentro de la función, sin necesidad de un constructor.
  const authService = inject(AuthService);
  const router = inject(Router);

  // 2. Lógica de decisión:
  // Leemos el valor actual del signal `isLoggedIn` desde el AuthService.
  // Recuerda que para leer un signal, se invoca como una función: isLoggedIn().
  if (authService.isLoggedIn()) {
    // Si el signal devuelve `true`, el usuario ha iniciado sesión.
    // Permitimos que la navegación continúe devolviendo `true`.
    return true;
  } else {
    // Si el signal devuelve `false`, el usuario no ha iniciado sesión.
    // Bloqueamos la navegación actual y redirigimos al usuario a la página de login.
    // `router.createUrlTree` es la forma moderna y segura de decirle al router
    // "cancela esta navegación y ve a esta otra ruta en su lugar".
    return router.createUrlTree(['/auth/login']);
  }
};
