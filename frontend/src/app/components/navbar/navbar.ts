import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { RolesUsuarios, Usuario } from '../../models/usuario';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-navbar',
  standalone: false,
  styleUrl: './navbar.css',
  templateUrl: './navbar.html',
})
export class Navbar implements OnDestroy {
  usuario: Usuario | null;
  private readonly subscription: Subscription;

  constructor(
    public readonly auth: AuthService,
    private readonly router: Router,
    private readonly changeDetector: ChangeDetectorRef,
  ) {
    this.usuario = auth.currentUserValue;
    this.subscription = auth.currentUser$.subscribe((usuario) => {
      this.usuario = usuario;
      this.changeDetector.markForCheck();
    });
  }

  get rolLabel(): string {
    switch (this.usuario?.rol) {
      case RolesUsuarios.PACIENTE: return 'Paciente';
      case RolesUsuarios.MEDICO: return 'Médico';
      case RolesUsuarios.ADMINISTRADOR: return 'Administración';
      default: return '';
    }
  }

  cerrarSesion(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
