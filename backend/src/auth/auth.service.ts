import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Usuario } from '../entities/usuario.entity';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { EstadosUsuarios, RolesUsuarios } from '../common/enums/roles-estados.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const email = loginDto.email.trim().toLowerCase();
    const { clave } = loginDto;

    const usuario = await this.usuarioRepository.findOne({
      where: { email },
      relations: {
        medico: true,
      },
    });

    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (usuario.estado !== EstadosUsuarios.ACTIVO) {
      throw new UnauthorizedException('El usuario se encuentra dado de baja o inactivo');
    }

    const passwordValida = await bcrypt.compare(clave, usuario.clave);
    if (!passwordValida) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (usuario.rol === RolesUsuarios.MEDICO && !usuario.medico) {
      throw new UnauthorizedException('El usuario médico no tiene un perfil profesional asociado');
    }

    const payload = {
      sub: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
      id_medico: usuario.medico ? usuario.medico.id : null,
    };

    return {
      access_token: this.jwtService.sign(payload),
      usuario: {
        id: usuario.id,
        apellidos: usuario.apellidos,
        nombres: usuario.nombres,
        email: usuario.email,
        rol: usuario.rol,
        id_medico: usuario.medico ? usuario.medico.id : null,
      },
    };
  }
}
