import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { clinicDateInputValue, formatClinicTime } from '../../common/clinic-date';
import { apiErrorMessage } from '../../common/api-error';
import { EstadosReservas, Reserva } from '../../models/reserva';
import { ReservasService } from '../../services/reservas';

@Component({
  selector: 'app-agenda-medico',
  standalone: false,
  styleUrl: './agenda-medico.css',
  templateUrl: './agenda-medico.html',
})
export class AgendaMedico implements OnInit {
  readonly EstadosReservas = EstadosReservas;
  fecha = clinicDateInputValue(new Date());
  reservas: Reserva[] = [];
  cargando = false;
  error = '';
  aviso = '';
  actualizandoId: number | null = null;

  constructor(
    private readonly reservasService: ReservasService,
    private readonly changeDetector: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.cargarAgenda();
  }

  cargarAgenda(): void {
    this.cargando = true;
    this.error = '';
    this.reservasService.listar(this.fecha).subscribe({
      next: (reservas) => {
        this.reservas = reservas;
        this.cargando = false;
        this.changeDetector.markForCheck();
      },
      error: (error) => {
        this.cargando = false;
        this.error = apiErrorMessage(error, 'No se pudo cargar la agenda para esa fecha.');
        this.changeDetector.markForCheck();
      },
    });
  }

  marcar(reserva: Reserva, estado: EstadosReservas): void {
    if (!this.puedeMarcar(reserva) || this.actualizandoId !== null) return;
    this.error = '';
    this.aviso = '';
    this.actualizandoId = reserva.id;
    this.reservasService.cambiarEstadoMedico(reserva.id, estado).subscribe({
      next: (actualizada) => {
        this.reservas = this.reservas.map((item) => item.id === actualizada.id ? actualizada : item);
        this.actualizandoId = null;
        this.aviso = `El turno se marcó como ${estado === EstadosReservas.ATENDIDO ? 'atendido' : 'ausente'}.`;
        this.changeDetector.markForCheck();
      },
      error: (error) => {
        this.actualizandoId = null;
        this.error = apiErrorMessage(error, 'No se pudo actualizar el estado del turno.');
        this.changeDetector.markForCheck();
      },
    });
  }

  puedeMarcar(reserva: Reserva): boolean {
    return reserva.estado === EstadosReservas.ACTIVO && new Date() >= new Date(reserva.fecha_hora);
  }

  estadoLabel(estado: EstadosReservas): string {
    return {
      [EstadosReservas.ACTIVO]: 'Reservado',
      [EstadosReservas.CANCELADO]: 'Cancelado',
      [EstadosReservas.ATENDIDO]: 'Atendido',
      [EstadosReservas.AUSENTE]: 'Ausente',
    }[estado];
  }

  formatoHora(valor: string): string {
    return formatClinicTime(valor);
  }

}
