import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Medico } from '../models/medico';

@Injectable({
  providedIn: 'root'
})
export class MedicosService {
  private apiUrl = '/api/medicos';

  constructor(private http: HttpClient) {}

  listar(): Observable<Medico[]> {
    return this.http.get<Medico[]>(this.apiUrl);
  }

  actualizarValorConsulta(id: number, valor_consulta: number): Observable<Medico> {
    return this.http.patch<Medico>(`${this.apiUrl}/${id}/valor-consulta`, { valor_consulta });
  }
}