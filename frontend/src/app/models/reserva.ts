import { Usuario } from './usuario';

export enum EstadosReservas {
  ACTIVO = 'ACTIVO',
  CANCELADO = 'CANCELADO',
  ATENDIDO = 'ATENDIDO',
  AUSENTE = 'AUSENTE'
}

export interface Reserva {
  id: number;
  id_medico: number;
  id_paciente: number;
  fecha_hora: string;
  estado: EstadosReservas;
  valor_consulta: number;
  medico: {
    id: number;
    matricula: number;
    nombres: string;
    apellidos: string;
  };
  paciente: Pick<Usuario, 'id' | 'nombres' | 'apellidos'>;
}

export interface HorarioDisponible {
  fecha_hora: string;
  hora_local: string;
}

export interface Disponibilidad {
  fecha: string;
  horarios: HorarioDisponible[];
}
