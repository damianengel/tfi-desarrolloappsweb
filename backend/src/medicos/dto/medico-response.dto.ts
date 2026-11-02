import { ApiProperty } from '@nestjs/swagger';

export class MedicoResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 45890 })
  matricula: number;

  @ApiProperty({ example: 15000 })
  valor_consulta: number;

  @ApiProperty({ example: 'Carlos' })
  nombres: string;

  @ApiProperty({ example: 'Perez' })
  apellidos: string;

  @ApiProperty({ example: 'carlos.perez@clinica.com' })
  email: string;
}