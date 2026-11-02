import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsISO8601, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CrearReservaDto {
  @ApiProperty({ example: 1, description: 'ID del médico' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  id_medico: number;

  @ApiProperty({ example: 2, description: 'ID del paciente (obligatorio si reserva admin)', required: false })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  id_paciente?: number;

  @ApiProperty({ example: '2026-11-05T10:00:00.000Z', description: 'Fecha y hora en formato ISO' })
  @IsISO8601()
  @IsNotEmpty()
  fecha_hora: string;
}
