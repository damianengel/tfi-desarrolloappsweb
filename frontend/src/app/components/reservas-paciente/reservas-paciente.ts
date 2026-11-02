import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { clinicDateInputValue, formatClinicDate, formatClinicTime } from '../../common/clinic-date';
import { Medico } from '../../models/medico';
import { EstadosReservas, HorarioDisponible, Reserva } from '../../models/reserva';
import { apiErrorMessage } from '../../common/api-error';
import { MedicosService } from '../../services/medicos';
import { ReservasService } from '../../services/reservas';

@Component({
  selector: 'app-reservas-paciente',
  standalone: false,
  styleUrl: './reservas-paciente.css',
  templateUrl: './reservas-paciente.html',
})
export class ReservasPaciente implements OnInit {
  medicos: Medico[] = [];
  reservas: Reserva[] = [];
  horarios: HorarioDisponible[] = [];
  idMedico: number | null = null;
  fecha = clinicDateInputValue(new Date());
  fechaMin = this.fecha;
  fechaMax = this.agregarDias(this.fecha, 30);
  fechaHoraSeleccionada = '';
  cargando = false;
  reservando = false;
  cancelandoId: number | null = null;
  error = '';
  aviso = '';

  constructor(
    private readonly medicosService: MedicosService,
    private readonly reservasService: ReservasService,
    private readonly changeDetector: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.medicosService.listar().subscribe({
      next: (medicos) => {
        this.medicos = medicos;
        this.changeDetector.markForCheck();
      },
      error: (error) => {
        this.error = apiErrorMessage(error, 'No se pudieron cargar los médicos.');
        this.changeDetector.markForCheck();
      },
    });
    this.cargarReservas();
  }

  cambiarBusqueda(): void {
    this.horarios = [];
    this.fechaHoraSeleccionada = '';
    this.error = '';
    if (!this.idMedico || !this.fecha) return;
    this.reservasService.disponibilidad(this.idMedico, this.fecha).subscribe({
      next: (disponibilidad) => {
        this.horarios = disponibilidad.horarios;
        this.changeDetector.markForCheck();
      },
      error: (error) => {
        this.error = apiErrorMessage(error, 'No se pudo consultar la disponibilidad.');
        this.changeDetector.markForCheck();
      },
    });
  }

  reservar(): void {
    if (!this.idMedico || !this.fechaHoraSeleccionada || this.reservando) return;
    this.error = '';
    this.aviso = '';
    this.reservando = true;
    this.reservasService
      .crearReserva({ id_medico: this.idMedico, fecha_hora: this.fechaHoraSeleccionada })
      .subscribe({
        next: () => {
          this.reservando = false;
          this.fechaHoraSeleccionada = '';
          this.aviso = 'El turno quedó reservado. El valor de la consulta se guardó para esta reserva.';
          this.changeDetector.markForCheck();
          this.cambiarBusqueda();
          this.cargarReservas();
        },
        error: (error) => {
          this.reservando = false;
          this.error = apiErrorMessage(error, 'No se pudo reservar el turno. Actualizá la disponibilidad e intentá nuevamente.');
          this.changeDetector.markForCheck();
        },
      });
  }

  cancelar(reserva: Reserva): void {
    if (!this.puedeCancelar(reserva) || this.cancelandoId !== null) return;
    this.error = '';
    this.aviso = '';
    this.cancelandoId = reserva.id;
    this.reservasService.cancelarReserva(reserva.id).subscribe({
      next: () => {
        this.cancelandoId = null;
        this.aviso = 'El turno fue cancelado.';
        this.changeDetector.markForCheck();
        this.cargarReservas();
      },
      error: (error) => {
        this.cancelandoId = null;
        this.error = apiErrorMessage(error, 'No se pudo cancelar el turno.');
        this.changeDetector.markForCheck();
      },
    });
  }

  puedeCancelar(reserva: Reserva): boolean {
    return reserva.estado === EstadosReservas.ACTIVO &&
      this.diaClinica(new Date()) < this.diaClinica(new Date(reserva.fecha_hora));
  }

  estadoLabel(estado: EstadosReservas): string {
    return {
      [EstadosReservas.ACTIVO]: 'Reservado',
      [EstadosReservas.CANCELADO]: 'Cancelado',
      [EstadosReservas.ATENDIDO]: 'Atendido',
      [EstadosReservas.AUSENTE]: 'Ausente',
    }[estado];
  }

  formatoPrecio(valor: number): string {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(valor);
  }

  formatoFecha(valor: string): string {
    return formatClinicDate(valor);
  }

  formatoHora(valor: string): string {
    return formatClinicTime(valor);
  }

  private cargarReservas(): void {
    this.cargando = true;
    this.reservasService.listar().subscribe({
      next: (reservas) => {
        this.reservas = reservas;
        this.cargando = false;
        this.changeDetector.markForCheck();
      },
      error: (error) => {
        this.cargando = false;
        this.error = apiErrorMessage(error, 'No se pudieron cargar tus turnos.');
        this.changeDetector.markForCheck();
      },
    });
  }

  private agregarDias(fecha: string, dias: number): string {
    const [year, month, day] = fecha.split('-').map(Number);
    const resultado = new Date(year, month - 1, day + dias);
    return clinicDateInputValue(resultado);
  }

  private diaClinica(date: Date): string {
    return clinicDateInputValue(date);
  }
}
