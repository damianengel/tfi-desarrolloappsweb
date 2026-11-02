import { Controller, Post, Get, Patch, Param, Body, Query, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ReservasService } from './reservas.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { RolesUsuarios } from '../common/enums/roles-estados.enum';
import { CrearReservaDto } from './dto/crear-reserva.dto';
import { CambiarEstadoTurnoDto } from './dto/cambiar-estado-turno.dto';
import { DisponibilidadQueryDto } from './dto/disponibilidad-query.dto';
import { DisponibilidadResponseDto } from './dto/disponibilidad-response.dto';
import { ReservaResponseDto } from './dto/reserva-response.dto';

@ApiTags('Reservas')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('reservas')
export class ReservasController {
  constructor(private readonly reservasService: ReservasService) {}

  @Post()
  @Roles(RolesUsuarios.PACIENTE, RolesUsuarios.ADMINISTRADOR)
  @ApiOperation({ summary: 'Reservar turno (Paciente o Administrador)' })
  @ApiResponse({ status: 201, type: ReservaResponseDto })
  async crear(@Body() dto: CrearReservaDto, @Request() req: any): Promise<ReservaResponseDto> {
    return this.reservasService.crearReserva(dto, req.user);
  }

  @Get('disponibilidad')
  @Roles(RolesUsuarios.PACIENTE, RolesUsuarios.ADMINISTRADOR)
  @ApiOperation({ summary: 'Consultar horarios disponibles de un médico' })
  @ApiResponse({ status: 200, type: DisponibilidadResponseDto })
  async disponibilidad(@Query() query: DisponibilidadQueryDto): Promise<DisponibilidadResponseDto> {
    return this.reservasService.obtenerDisponibilidad(query);
  }

  @Get()
  @ApiOperation({ summary: 'Listar turnos según el rol autenticado' })
  @ApiQuery({ name: 'fecha', required: false, description: 'Formato YYYY-MM-DD (para médicos)' })
  @ApiResponse({ status: 200, type: [ReservaResponseDto] })
  async listar(@Request() req: any, @Query('fecha') fecha?: string): Promise<ReservaResponseDto[]> {
    return this.reservasService.listarPorUsuario(req.user, fecha);
  }

  @Patch(':id/cancelar')
  @Roles(RolesUsuarios.PACIENTE, RolesUsuarios.ADMINISTRADOR)
  @ApiOperation({ summary: 'Cancelar reserva' })
  @ApiResponse({ status: 200, type: ReservaResponseDto })
  async cancelar(@Param('id', ParseIntPipe) id: number, @Request() req: any): Promise<ReservaResponseDto> {
    return this.reservasService.cancelarReserva(id, req.user);
  }

  @Patch(':id/estado-medico')
  @Roles(RolesUsuarios.MEDICO)
  @ApiOperation({ summary: 'Marcar turno como ATENDIDO o AUSENTE (Solo Médicos)' })
  @ApiResponse({ status: 200, type: ReservaResponseDto })
  async cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CambiarEstadoTurnoDto,
    @Request() req: any,
  ): Promise<ReservaResponseDto> {
    return this.reservasService.cambiarEstadoMedico(id, dto.estado, req.user);
  }
}
