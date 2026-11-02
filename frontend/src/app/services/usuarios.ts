import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Paciente } from '../models/usuario';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  constructor(private readonly http: HttpClient) {}

  listarPacientesActivos(): Observable<Paciente[]> {
    return this.http.get<Paciente[]>('/api/usuarios/pacientes');
  }
}
