import { ApiProperty } from '@nestjs/swagger';
import { RolesUsuarios } from '../../common/enums/roles-estados.enum';

export class UsuarioAuthDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Admin' })
  apellidos: string;

  @ApiProperty({ example: 'Sistema' })
  nombres: string;

  @ApiProperty({ example: 'admin@clinica.com' })
  email: string;

  @ApiProperty({ enum: RolesUsuarios, example: RolesUsuarios.ADMINISTRADOR })
  rol: RolesUsuarios;

  @ApiProperty({ example: 10, required: false, nullable: true })
  id_medico?: number | null;
}

export class LoginResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsIn...' })
  access_token: string;

  @ApiProperty({ type: UsuarioAuthDto })
  usuario: UsuarioAuthDto;
}