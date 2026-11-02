import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { RolesUsuarios } from '../../models/usuario';

@Component({
  selector: 'app-login',
  standalone: false,
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login implements OnInit {
  email = '';
  clave = '';
  error = '';
  cargando = false;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    const usuario = this.authService.currentUserValue;
    if (usuario) this.router.navigateByUrl(this.rutaPorRol(usuario.rol));
  }

  ingresar(): void {
    if (this.cargando) return;
    this.error = '';
    this.cargando = true;
    this.authService.login(this.email.trim(), this.clave).subscribe({
      next: ({ usuario }) => this.router.navigateByUrl(this.rutaPorRol(usuario.rol)),
      error: (error: HttpErrorResponse) => {
        const mensaje = error.error?.message;
        this.error = Array.isArray(mensaje)
          ? mensaje.join('. ')
          : mensaje || 'No se pudo iniciar sesión. Verificá el correo y la contraseña.';
        this.cargando = false;
      },
    });
  }

  private rutaPorRol(rol: RolesUsuarios): string {
    switch (rol) {
      case RolesUsuarios.PACIENTE:
        return '/reservas';
      case RolesUsuarios.MEDICO:
        return '/agenda';
      case RolesUsuarios.ADMINISTRADOR:
        return '/admin';
    }
  }
}
