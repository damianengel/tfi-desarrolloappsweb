import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { clinicDateString, clinicDateTimeToUtc, getClinicDateTime, nextClinicDate } from '../common/clinic-time.util';
import { EstadosReservas, EstadosUsuarios, RolesUsuarios } from '../common/enums/roles-estados.enum';
import { Medico } from '../entities/medico.entity';
import { Reserva } from '../entities/reserva.entity';
import { Usuario } from '../entities/usuario.entity';
import { CrearReservaDto } from './dto/crear-reserva.dto';
import { DisponibilidadQueryDto } from './dto/disponibilidad-query.dto';
import { DisponibilidadResponseDto, HorarioDisponibleDto } from './dto/disponibilidad-response.dto';
import { ReservaResponseDto } from './dto/reserva-response.dto';

interface UsuarioActual {
  id: number;
  rol: RolesUsuarios;
  id_medico: number | null;
}

@Injectable()
export class ReservasService {
  private readonly timeZone: string;

  constructor(
    @InjectRepository(Reserva)
    private readonly reservaRepository: Repository<Reserva>,
    @InjectRepository(Medico)
    private readonly medicoRepository: Repository<Medico>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    configService: ConfigService,
  ) {
    this.timeZone = configService.get<string>('CLINIC_TIMEZONE', 'America/Argentina/Buenos_Aires');
  }

  async crearReserva(dto: CrearReservaDto, usuarioActual: UsuarioActual): Promise<ReservaResponseDto> {
    const medico = await this.medicoRepository.findOne({
      where: { id: dto.id_medico },
      relations: { usuario: true },
    });
    if (
      !medico ||
      medico.usuario.estado !== EstadosUsuarios.ACTIVO ||
      medico.usuario.rol !== RolesUsuarios.MEDICO
    ) {
      throw new NotFoundException('Médico activo no encontrado');
    }

    let pacienteId = usuarioActual.id;
    if (usuarioActual.rol === RolesUsuarios.ADMINISTRADOR) {
      if (!dto.id_paciente) {
        throw new BadRequestException('El administrador debe seleccionar un paciente');
      }
      const paciente = await this.usuarioRepository.findOne({ where: { id: dto.id_paciente } });
      if (
        !paciente ||
        paciente.rol !== RolesUsuarios.PACIENTE ||
        paciente.estado !== EstadosUsuarios.ACTIVO
      ) {
        throw new NotFoundException('Paciente activo no encontrado');
      }
      pacienteId = paciente.id;
    } else if (usuarioActual.rol !== RolesUsuarios.PACIENTE) {
      throw new ForbiddenException('Solo pacientes y administradores pueden reservar turnos');
    }

    const fechaReserva = new Date(dto.fecha_hora);
    if (Number.isNaN(fechaReserva.getTime())) {
      throw new BadRequestException('La fecha y hora no son válidas');
    }
    const ahora = new Date();
    if (fechaReserva <= ahora) {
      throw new BadRequestException('La reserva debe ser para una fecha y hora futura');
    }
    if (fechaReserva.getTime() > ahora.getTime() + 30 * 24 * 60 * 60 * 1000) {
      throw new BadRequestException('Las reservas se pueden realizar con un máximo de 30 días de anticipación');
    }

    const fechaLocal = getClinicDateTime(fechaReserva, this.timeZone);
    if (
      fechaLocal.hour < 8 ||
      fechaLocal.hour >= 16 ||
      fechaLocal.minute !== 0 ||
      fechaLocal.second !== 0 ||
      fechaReserva.getUTCMilliseconds() !== 0
    ) {
      throw new BadRequestException('Los turnos son de una hora y comienzan entre las 08:00 y las 15:00 hs');
    }

    const turnoOcupado = await this.reservaRepository.findOne({
      where: {
        id_medico: medico.id,
        fecha_hora: fechaReserva,
        estado: EstadosReservas.ACTIVO,
      },
    });
    if (turnoOcupado) {
      throw new ConflictException('El horario seleccionado ya está ocupado para este médico');
    }

    const nuevaReserva = this.reservaRepository.create({
      id_medico: medico.id,
      id_paciente: pacienteId,
      fecha_hora: fechaReserva,
      estado: EstadosReservas.ACTIVO,
      valor_consulta: medico.valor_consulta,
    });

    try {
      const reservaGuardada = await this.reservaRepository.save(nuevaReserva);
      return await this.obtenerPorId(reservaGuardada.id);
    } catch (error) {
      if ((error as { code?: string }).code === '23505') {
        throw new ConflictException('Ese horario acaba de ser reservado por otra persona');
      }
      throw error;
    }
  }

  async listarPorUsuario(usuarioActual: UsuarioActual, fecha?: string): Promise<ReservaResponseDto[]> {
    const where: Record<string, unknown> = {};

    if (usuarioActual.rol === RolesUsuarios.PACIENTE) {
      where['id_paciente'] = usuarioActual.id;
    } else if (usuarioActual.rol === RolesUsuarios.MEDICO) {
      if (!usuarioActual.id_medico) {
        throw new ForbiddenException('El usuario no posee perfil médico asociado');
      }
      where['id_medico'] = usuarioActual.id_medico;
      if (fecha) {
        this.validarFecha(fecha);
        const desde = clinicDateTimeToUtc(fecha, this.timeZone);
        const hasta = clinicDateTimeToUtc(nextClinicDate(fecha), this.timeZone);
        where['fecha_hora'] = Between(desde, hasta);
      }
    } else if (usuarioActual.rol !== RolesUsuarios.ADMINISTRADOR) {
      throw new ForbiddenException('No tienes permisos para consultar turnos');
    }

    const reservas = await this.reservaRepository.find({
      where,
      relations: { medico: { usuario: true }, paciente: true },
      order: { fecha_hora: 'ASC' },
    });
    return reservas.map((reserva) => this.toResponse(reserva));
  }

  async obtenerDisponibilidad(query: DisponibilidadQueryDto): Promise<DisponibilidadResponseDto> {
    this.validarFecha(query.fecha);
    const medico = await this.medicoRepository.findOne({
      where: { id: query.id_medico },
      relations: { usuario: true },
    });
    if (
      !medico ||
      medico.usuario.estado !== EstadosUsuarios.ACTIVO ||
      medico.usuario.rol !== RolesUsuarios.MEDICO
    ) {
      throw new NotFoundException('Médico activo no encontrado');
    }

    const desde = clinicDateTimeToUtc(query.fecha, this.timeZone);
    const hasta = clinicDateTimeToUtc(nextClinicDate(query.fecha), this.timeZone);
    const reservas = await this.reservaRepository.find({
      where: {
        id_medico: query.id_medico,
        fecha_hora: Between(desde, hasta),
        estado: EstadosReservas.ACTIVO,
      },
      select: { fecha_hora: true },
    });
    const ocupados = new Set(reservas.map(({ fecha_hora }) => new Date(fecha_hora).getTime()));
    const ahora = new Date();
    const limite = new Date(ahora.getTime() + 30 * 24 * 60 * 60 * 1000);
    const horarios: HorarioDisponibleDto[] = [];

    for (let hora = 8; hora < 16; hora += 1) {
      const turno = clinicDateTimeToUtc(query.fecha, this.timeZone, hora);
      if (turno > ahora && turno <= limite && !ocupados.has(turno.getTime())) {
        horarios.push({
          fecha_hora: turno.toISOString(),
          hora_local: `${String(hora).padStart(2, '0')}:00`,
        });
      }
    }

    return { fecha: query.fecha, horarios };
  }

  async cancelarReserva(id: number, usuarioActual: UsuarioActual): Promise<ReservaResponseDto> {
    const reserva = await this.reservaRepository.findOne({ where: { id } });
    if (!reserva) throw new NotFoundException('Reserva no encontrada');
    if (reserva.estado !== EstadosReservas.ACTIVO) {
      throw new BadRequestException('Solo se pueden cancelar turnos en estado ACTIVO');
    }

    const ahora = new Date();
    if (usuarioActual.rol === RolesUsuarios.PACIENTE) {
      if (reserva.id_paciente !== usuarioActual.id) {
        throw new ForbiddenException('No tienes permiso para cancelar esta reserva');
      }
      const hoy = clinicDateString(ahora, this.timeZone);
      const fechaTurno = clinicDateString(new Date(reserva.fecha_hora), this.timeZone);
      if (hoy >= fechaTurno) {
        throw new BadRequestException('Los pacientes solo pueden cancelar hasta el día anterior a la consulta');
      }
    } else if (usuarioActual.rol === RolesUsuarios.ADMINISTRADOR) {
      if (ahora >= new Date(reserva.fecha_hora)) {
        throw new BadRequestException('El administrador solo puede cancelar hasta el inicio de la consulta');
      }
    } else {
      throw new ForbiddenException('Los médicos no tienen autorización para cancelar reservas');
    }

    reserva.estado = EstadosReservas.CANCELADO;
    await this.reservaRepository.save(reserva);
    return this.obtenerPorId(id);
  }

  async cambiarEstadoMedico(
    id: number,
    nuevoEstado: EstadosReservas,
    usuarioActual: UsuarioActual,
  ): Promise<ReservaResponseDto> {
    const reserva = await this.reservaRepository.findOne({ where: { id } });
    if (!reserva) throw new NotFoundException('Reserva no encontrada');
    if (!usuarioActual.id_medico || reserva.id_medico !== usuarioActual.id_medico) {
      throw new ForbiddenException('No puedes modificar turnos asignados a otro profesional');
    }
    if (reserva.estado !== EstadosReservas.ACTIVO) {
      throw new BadRequestException('Solo se puede modificar un turno en estado ACTIVO');
    }
    if (nuevoEstado !== EstadosReservas.ATENDIDO && nuevoEstado !== EstadosReservas.AUSENTE) {
      throw new BadRequestException('El médico solo puede marcar el turno como ATENDIDO o AUSENTE');
    }
    if (new Date() < new Date(reserva.fecha_hora)) {
      throw new BadRequestException('El turno solo puede marcarse al llegar su horario de inicio');
    }

    reserva.estado = nuevoEstado;
    await this.reservaRepository.save(reserva);
    return this.obtenerPorId(id);
  }

  private async obtenerPorId(id: number): Promise<ReservaResponseDto> {
    const reserva = await this.reservaRepository.findOne({
      where: { id },
      relations: { medico: { usuario: true }, paciente: true },
    });
    if (!reserva) throw new NotFoundException('Reserva no encontrada');
    return this.toResponse(reserva);
  }

  private toResponse(reserva: Reserva): ReservaResponseDto {
    return {
      id: reserva.id,
      id_medico: reserva.id_medico,
      id_paciente: reserva.id_paciente,
      fecha_hora: new Date(reserva.fecha_hora).toISOString(),
      estado: reserva.estado,
      valor_consulta: reserva.valor_consulta,
      medico: {
        id: reserva.medico.id,
        nombres: reserva.medico.usuario.nombres,
        apellidos: reserva.medico.usuario.apellidos,
        matricula: reserva.medico.matricula,
      },
      paciente: {
        id: reserva.paciente.id,
        nombres: reserva.paciente.nombres,
        apellidos: reserva.paciente.apellidos,
      },
    };
  }

  private validarFecha(fecha: string): void {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      throw new BadRequestException('La fecha debe tener formato AAAA-MM-DD');
    }
    const fechaUtc = new Date(`${fecha}T00:00:00.000Z`);
    if (Number.isNaN(fechaUtc.getTime()) || fechaUtc.toISOString().slice(0, 10) !== fecha) {
      throw new BadRequestException('La fecha indicada no existe');
    }
  }
}
