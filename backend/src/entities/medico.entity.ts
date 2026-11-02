import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { Usuario } from './usuario.entity';
import { Reserva } from './reserva.entity';

@Entity({ name: 'medicos' })
export class Medico {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'id_usuario' })
  id_usuario: number;

  @OneToOne(() => Usuario, (usuario) => usuario.medico, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

  @Column({ type: 'int' })
  matricula: number;

  @Column({ name: 'valor_consulta', type: 'int' })
  valor_consulta: number;

  @OneToMany(() => Reserva, (reserva) => reserva.medico)
  reservas: Reserva[];
}