import { ApiProperty } from '@nestjs/swagger';

export class PacienteReservaDto {
  @ApiProperty({ example: 2 })
  id: number;

  @ApiProperty({ example: 'María' })
  nombres: string;

  @ApiProperty({ example: 'Gómez' })
  apellidos: string;
}
