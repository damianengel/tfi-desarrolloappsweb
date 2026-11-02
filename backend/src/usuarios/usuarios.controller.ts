import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/guards/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RolesUsuarios } from '../common/enums/roles-estados.enum';
import { PacienteReservaDto } from './dto/paciente-reserva.dto';
import { UsuariosService } from './usuarios.service';

@ApiTags('Usuarios (consulta)')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get('pacientes')
  @Roles(RolesUsuarios.ADMINISTRADOR)
  @ApiOperation({ summary: 'Listar pacientes activos para reservar un turno' })
  @ApiResponse({ status: 200, type: [PacienteReservaDto] })
  listarPacientes(): Promise<PacienteReservaDto[]> {
    return this.usuariosService.listarPacientesActivos();
  }
}
