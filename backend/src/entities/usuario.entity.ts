import { Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany } from 'typeorm';
import { EstadosUsuarios, RolesUsuarios } from '../common/enums/roles-estados.enum';
import { Medico } from './medico.entity';
import { Reserva } from './reserva.entity';

@Entity({ name: 'usuarios' })
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', unique: true })
  documento: string;

  @Column({ type: 'text' })
  apellidos: string;

  @Column({ type: 'text' })
  nombres: string;

  @Column({ type: 'text', unique: true })
  email: string;

  @Column({ type: 'text' })
  clave: string;

  @Column({
    type: 'enum',
    enum: EstadosUsuarios,
    enumName: 'estados_usuarios_enum',
    default: EstadosUsuarios.ACTIVO,
  })
  estado: EstadosUsuarios;

  @Column({
    type: 'enum',
    enum: RolesUsuarios,
    enumName: 'roles_usuarios_enum',
  })
  rol: RolesUsuarios;

  @OneToOne(() => Medico, (medico) => medico.usuario)
  medico: Medico;

  @OneToMany(() => Reserva, (reserva) => reserva.paciente)
  reservas: Reserva[];
}
