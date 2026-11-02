import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class ActualizarValorConsultaDto {
  @ApiProperty({ example: 18000, description: 'Nuevo valor de la consulta' })
  @IsInt({ message: 'El valor de la consulta debe ser un número entero' })
  @Min(1, { message: 'El valor de la consulta debe ser mayor a 0' })
  valor_consulta: number;
}