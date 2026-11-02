import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { clinicDateInputValue, formatClinicDate, formatClinicTime } from '../../common/clinic-date';
import { apiErrorMessage } from '../../common/api-error';
import { Medico } from '../../models/medico';
import { EstadosReservas, HorarioDisponible, Reserva } from '../../models/reserva';
import { Paciente } from '../../models/usuario';
import { MedicosService } from '../../services/medicos';
import { ReservasService } from '../../services/reservas';
import { UsuariosService } from '../../services/usuarios';

@Component({
  selector: 'app-admin-panel',
  standalone: false,
  styleUrl: './admin-panel.css',
  templateUrl: './admin-panel.html',
})
export class AdminPanel implements OnInit {
  medicos: Medico[] = [];
  pacientes: Paciente[] = [];
  reservas: Reserva[] = [];
  horarios: HorarioDisponible[] = [];
  valoresConsulta: Record<number, number> = {};
  idMedico: number | null = null;
  idPaciente: number | null = null;
  fecha = clinicDateInputValue(new Date());
  fechaMin = this.fecha;
  fechaMax = this.agregarDias(this.fecha, 30);
  fechaHoraSeleccionada = '';
  error = '';
  aviso = '';
  cargando = false;
  reservando = false;
  cancelandoId: number | null = null;
  actualizandoMedicoId: number | null = null;

  constructor(
    private readonly medicosService: MedicosService,
    private readonly reservasService: ReservasService,
    private readonly usuariosService: UsuariosService,
    private readonly changeDetector: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.medicosService.listar().subscribe({
      next: (medicos) => {
        this.medicos = medicos;
        this.valoresConsulta = Object.fromEntries(medicos.map((medico) => [medico.id, medico.valor_consulta]));
        this.changeDetector.markForCheck();
      },
      error: (error) => {
        this.error = apiErrorMessage(error, 'No se pudieron cargar los médicos.');
        this.changeDetector.markForCheck();
      },
    });
    this.usuariosService.listarPacientesActivos().subscribe({
      next: (pacientes) => {
        this.pacientes = pacientes;
        this.changeDetector.markForCheck();
      },
      error: (error) => {
        this.error = apiErrorMessage(error, 'No se pudieron cargar los pacientes.');
        this.changeDetector.markForCheck();
      },
    });
    this.cargarReservas();
  }

  cambiarBusqueda(): void {
    this.horarios = [];
    this.fechaHoraSeleccionada = '';
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
    if (!this.idMedico || !this.idPaciente || !this.fechaHoraSeleccionada || this.reservando) return;
    this.error = '';
    this.aviso = '';
    this.reservando = true;
    this.reservasService.crearReserva({
      id_medico: this.idMedico,
      id_paciente: this.idPaciente,
      fecha_hora: this.fechaHoraSeleccionada,
    }).subscribe({
      next: () => {
        this.reservando = false;
        this.fechaHoraSeleccionada = '';
        this.aviso = 'Turno reservado. El valor actual del profesional quedó congelado en esta reserva.';
        this.changeDetector.markForCheck();
        this.cambiarBusqueda();
        this.cargarReservas();
      },
      error: (error) => {
        this.reservando = false;
        this.error = apiErrorMessage(error, 'No se pudo reservar el turno. Actualizá los horarios e intentá otra vez.');
        this.changeDetector.markForCheck();
      },
    });
  }

  actualizarValor(medico: Medico): void {
    const valor = Number(this.valoresConsulta[medico.id]);
    if (!Number.isInteger(valor) || valor < 1 || this.actualizandoMedicoId !== null) return;
    this.error = '';
    this.aviso = '';
    this.actualizandoMedicoId = medico.id;
    this.medicosService.actualizarValorConsulta(medico.id, valor).subscribe({
      next: (actualizado) => {
        this.medicos = this.medicos.map((item) => item.id === actualizado.id ? actualizado : item);
        this.valoresConsulta[medico.id] = actualizado.valor_consulta;
        this.actualizandoMedicoId = null;
        this.aviso = `Se actualizó el valor de la consulta de Dr. ${actualizado.apellidos}.`;
        this.changeDetector.markForCheck();
      },
      error: (error) => {
        this.actualizandoMedicoId = null;
        this.error = apiErrorMessage(error, 'No se pudo actualizar el valor de la consulta.');
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
    return reserva.estado === EstadosReservas.ACTIVO && new Date() < new Date(reserva.fecha_hora);
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
      error: (error: HttpErrorResponse) => {
        this.cargando = false;
        this.error = apiErrorMessage(error, 'No se pudieron cargar las reservas.');
        this.changeDetector.markForCheck();
      },
    });
  }

  private agregarDias(fecha: string, dias: number): string {
    const [year, month, day] = fecha.split('-').map(Number);
    return clinicDateInputValue(new Date(year, month - 1, day + dias));
  }
}
