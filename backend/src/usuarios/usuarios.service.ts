import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstadosUsuarios, RolesUsuarios } from '../common/enums/roles-estados.enum';
import { Usuario } from '../entities/usuario.entity';
import { PacienteReservaDto } from './dto/paciente-reserva.dto';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async listarPacientesActivos(): Promise<PacienteReservaDto[]> {
    const pacientes = await this.usuarioRepository.find({
      where: { rol: RolesUsuarios.PACIENTE, estado: EstadosUsuarios.ACTIVO },
      select: { id: true, nombres: true, apellidos: true },
      order: { apellidos: 'ASC', nombres: 'ASC' },
    });

    return pacientes.map(({ id, nombres, apellidos }) => ({ id, nombres, apellidos }));
  }
}
