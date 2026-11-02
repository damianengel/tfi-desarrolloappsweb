import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstadosUsuarios, RolesUsuarios } from '../common/enums/roles-estados.enum';
import { Medico } from '../entities/medico.entity';
import { ActualizarValorConsultaDto } from './dto/actualizar-valor-consulta.dto';
import { MedicoResponseDto } from './dto/medico-response.dto';

@Injectable()
export class MedicosService {
  constructor(
    @InjectRepository(Medico)
    private readonly medicoRepository: Repository<Medico>,
  ) {}

  async listarTodos(): Promise<MedicoResponseDto[]> {
    const medicos = await this.medicoRepository.find({
      where: { usuario: { estado: EstadosUsuarios.ACTIVO, rol: RolesUsuarios.MEDICO } },
      relations: { usuario: true },
    });

    return medicos.map((m) => ({
      id: m.id,
      matricula: m.matricula,
      valor_consulta: m.valor_consulta,
      nombres: m.usuario.nombres,
      apellidos: m.usuario.apellidos,
      email: m.usuario.email,
    }));
  }

  async actualizarValorConsulta(id: number, dto: ActualizarValorConsultaDto): Promise<MedicoResponseDto> {
    const medico = await this.medicoRepository.findOne({ where: { id }, relations: { usuario: true } });
    if (!medico) {
      throw new NotFoundException(`Médico con ID ${id} no encontrado`);
    }

    medico.valor_consulta = dto.valor_consulta;
    const actualizado = await this.medicoRepository.save(medico);
    return {
      id: actualizado.id,
      matricula: actualizado.matricula,
      valor_consulta: actualizado.valor_consulta,
      nombres: medico.usuario.nombres,
      apellidos: medico.usuario.apellidos,
      email: medico.usuario.email,
    };
  }
}
