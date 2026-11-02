import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Matches, Min } from 'class-validator';

export class DisponibilidadQueryDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id_medico: number;

  @ApiProperty({ example: '2026-11-05', description: 'Fecha de consulta en formato AAAA-MM-DD' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'La fecha debe tener formato AAAA-MM-DD' })
  fecha: string;
}
