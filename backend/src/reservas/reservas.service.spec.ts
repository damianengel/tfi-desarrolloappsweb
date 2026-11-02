import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { clinicDateString, clinicDateTimeToUtc, nextClinicDate } from '../common/clinic-time.util';
import { EstadosReservas, EstadosUsuarios, RolesUsuarios } from '../common/enums/roles-estados.enum';
import { Reserva } from '../entities/reserva.entity';
import { ReservasService } from './reservas.service';

describe('ReservasService', () => {
  const timeZone = 'America/Argentina/Buenos_Aires';
  let reservas: Record<string, jest.Mock>;
  let medico: Record<string, jest.Mock>;
  let usuarios: Record<string, jest.Mock>;
  let service: ReservasService;

  beforeEach(() => {
    reservas = {
      create: jest.fn((data) => data),
      save: jest.fn(async (data) => ({ ...data, id: 41 })),
      findOne: jest.fn(),
    };
    medico = {
      findOne: jest.fn().mockResolvedValue({
        id: 3,
        matricula: 45890,
        valor_consulta: 18000,
        usuario: { estado: EstadosUsuarios.ACTIVO, rol: RolesUsuarios.MEDICO },
      }),
    };
    usuarios = { findOne: jest.fn() };
    service = new ReservasService(
      reservas as any,
      medico as any,
      usuarios as any,
      { get: (_key: string, fallback: string) => fallback } as ConfigService,
    );
  });

  it('reserves an available hour and freezes the current doctor fee', async () => {
    const fecha = nextClinicDate(clinicDateString(new Date(), timeZone));
    const fechaHora = clinicDateTimeToUtc(fecha, timeZone, 10);
    const saved: Reserva = {
      id: 41,
      id_medico: 3,
      id_paciente: 8,
      fecha_hora: fechaHora,
      estado: EstadosReservas.ACTIVO,
      valor_consulta: 18000,
      medico: {
        id: 3,
        id_usuario: 9,
        matricula: 45890,
        valor_consulta: 18000,
        usuario: { nombres: 'Carlos', apellidos: 'Pérez' } as any,
        reservas: [],
      },
      paciente: { id: 8, nombres: 'María', apellidos: 'Gómez' } as any,
    };
    reservas.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(saved);

    const response = await service.crearReserva(
      { id_medico: 3, fecha_hora: fechaHora.toISOString() },
      { id: 8, rol: RolesUsuarios.PACIENTE, id_medico: null },
    );

    expect(reservas.save).toHaveBeenCalledWith(expect.objectContaining({
      id_medico: 3,
      id_paciente: 8,
      valor_consulta: 18000,
      estado: EstadosReservas.ACTIVO,
    }));
    expect(response.valor_consulta).toBe(18000);
    expect(response.paciente.apellidos).toBe('Gómez');
  });

  it('rejects booking outside the clinic opening hours', async () => {
    const fecha = nextClinicDate(clinicDateString(new Date(), timeZone));
    const fueraDeHorario = clinicDateTimeToUtc(fecha, timeZone, 16);

    await expect(service.crearReserva(
      { id_medico: 3, fecha_hora: fueraDeHorario.toISOString() },
      { id: 8, rol: RolesUsuarios.PACIENTE, id_medico: null },
    )).rejects.toBeInstanceOf(BadRequestException);
    expect(reservas.save).not.toHaveBeenCalled();
  });

  it('rejects an already occupied active appointment', async () => {
    const fecha = nextClinicDate(clinicDateString(new Date(), timeZone));
    const fechaHora = clinicDateTimeToUtc(fecha, timeZone, 10);
    reservas.findOne.mockResolvedValue({ id: 17, estado: EstadosReservas.ACTIVO });

    await expect(service.crearReserva(
      { id_medico: 3, fecha_hora: fechaHora.toISOString() },
      { id: 8, rol: RolesUsuarios.PACIENTE, id_medico: null },
    )).rejects.toThrow('ya está ocupado');
    expect(reservas.save).not.toHaveBeenCalled();
  });
});
