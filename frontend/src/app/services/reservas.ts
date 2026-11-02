import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Disponibilidad, EstadosReservas, Reserva } from '../models/reserva';

@Injectable({
  providedIn: 'root'
})
export class ReservasService {
  private apiUrl = '/api/reservas';

  constructor(private http: HttpClient) {}

  crearReserva(datos: { id_medico: number; fecha_hora: string; id_paciente?: number }): Observable<Reserva> {
    return this.http.post<Reserva>(this.apiUrl, datos);
  }

  listar(fecha?: string): Observable<Reserva[]> {
    let params = new HttpParams();
    if (fecha) {
      params = params.set('fecha', fecha);
    }
    return this.http.get<Reserva[]>(this.apiUrl, { params });
  }

  disponibilidad(idMedico: number, fecha: string): Observable<Disponibilidad> {
    const params = new HttpParams().set('id_medico', idMedico).set('fecha', fecha);
    return this.http.get<Disponibilidad>(`${this.apiUrl}/disponibilidad`, { params });
  }

  cancelarReserva(id: number): Observable<Reserva> {
    return this.http.patch<Reserva>(`${this.apiUrl}/${id}/cancelar`, {});
  }

  cambiarEstadoMedico(id: number, estado: EstadosReservas): Observable<Reserva> {
    return this.http.patch<Reserva>(`${this.apiUrl}/${id}/estado-medico`, { estado });
  }
}
