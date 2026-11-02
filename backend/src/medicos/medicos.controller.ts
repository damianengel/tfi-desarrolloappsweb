import { Controller, Get, Patch, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { MedicosService } from './medicos.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { RolesUsuarios } from '../common/enums/roles-estados.enum';
import { ActualizarValorConsultaDto } from './dto/actualizar-valor-consulta.dto';
import { MedicoResponseDto } from './dto/medico-response.dto';

@ApiTags('Médicos')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('medicos')
export class MedicosController {
  constructor(private readonly medicosService: MedicosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar médicos registrados' })
  @ApiResponse({ status: 200, type: [MedicoResponseDto] })
  async listar(): Promise<MedicoResponseDto[]> {
    return this.medicosService.listarTodos();
  }

  @Patch(':id/valor-consulta')
  @Roles(RolesUsuarios.ADMINISTRADOR)
  @ApiOperation({ summary: 'Modificar valor de la consulta (Solo Administrador)' })
  async actualizarValor(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarValorConsultaDto,
  ): Promise<MedicoResponseDto> {
    return this.medicosService.actualizarValorConsulta(id, dto);
  }
}
