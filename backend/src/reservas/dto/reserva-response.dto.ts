import { ApiProperty } from '@nestjs/swagger';
import { EstadosReservas } from '../../common/enums/roles-estados.enum';

export class PersonaReservaDto {
  @ApiProperty({ example: 2 })
  id: number;

  @ApiProperty({ example: 'María' })
  nombres: string;

  @ApiProperty({ example: 'Gómez' })
  apellidos: string;
}

export class MedicoReservaDto extends PersonaReservaDto {
  @ApiProperty({ example: 45890 })
  matricula: number;
}

export class ReservaResponseDto {
  @ApiProperty({ example: 17 })
  id: number;

  @ApiProperty({ example: 1 })
  id_medico: number;

  @ApiProperty({ example: 2 })
  id_paciente: number;

  @ApiProperty({ example: '2026-11-05T13:00:00.000Z' })
  fecha_hora: string;

  @ApiProperty({ enum: EstadosReservas, example: EstadosReservas.ACTIVO })
  estado: EstadosReservas;

  @ApiProperty({ example: 18000 })
  valor_consulta: number;

  @ApiProperty({ type: MedicoReservaDto })
  medico: MedicoReservaDto;

  @ApiProperty({ type: PersonaReservaDto })
  paciente: PersonaReservaDto;
}
