import { ApiProperty } from '@nestjs/swagger';

export class HorarioDisponibleDto {
  @ApiProperty({ example: '2026-11-05T13:00:00.000Z' })
  fecha_hora: string;

  @ApiProperty({ example: '10:00' })
  hora_local: string;
}

export class DisponibilidadResponseDto {
  @ApiProperty({ example: '2026-11-05' })
  fecha: string;

  @ApiProperty({ type: [HorarioDisponibleDto] })
  horarios: HorarioDisponibleDto[];
}
