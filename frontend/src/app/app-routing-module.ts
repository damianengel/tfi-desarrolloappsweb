import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { Login } from './components/login/login';
import { ReservasPaciente } from './components/reservas-paciente/reservas-paciente';
import { AgendaMedico } from './components/agenda-medico/agenda-medico';
import { AdminPanel } from './components/admin-panel/admin-panel';

import { AuthGuard } from './guards/auth-guard';
import { RolesUsuarios } from './models/usuario';

const routes: Routes = [
  { path: 'login', component: Login },
  {
    path: 'reservas',
    component: ReservasPaciente,
    canActivate: [AuthGuard],
    data: { roles: [RolesUsuarios.PACIENTE, RolesUsuarios.ADMINISTRADOR] }
  },
  {
    path: 'agenda',
    component: AgendaMedico,
    canActivate: [AuthGuard],
    data: { roles: [RolesUsuarios.MEDICO] }
  },
  {
    path: 'admin',
    component: AdminPanel,
    canActivate: [AuthGuard],
    data: { roles: [RolesUsuarios.ADMINISTRADOR] }
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
