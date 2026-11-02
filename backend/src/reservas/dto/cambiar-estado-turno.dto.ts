import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { EstadosReservas } from '../../common/enums/roles-estados.enum';

export class CambiarEstadoTurnoDto {
  @ApiProperty({ enum: [EstadosReservas.ATENDIDO, EstadosReservas.AUSENTE], example: EstadosReservas.ATENDIDO })
  @IsEnum(EstadosReservas, { message: 'El estado debe ser ATENDIDO o AUSENTE' })
  estado: EstadosReservas;
}