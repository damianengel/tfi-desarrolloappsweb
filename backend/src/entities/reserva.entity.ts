import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { EstadosReservas } from '../common/enums/roles-estados.enum';
import { Medico } from './medico.entity';
import { Usuario } from './usuario.entity';

@Entity({ name: 'reservas' })
export class Reserva {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'id_medico' })
  id_medico: number;

  @ManyToOne(() => Medico, (medico) => medico.reservas)
  @JoinColumn({ name: 'id_medico' })
  medico: Medico;

  @Column({ name: 'id_paciente' })
  id_paciente: number;

  @ManyToOne(() => Usuario, (usuario) => usuario.reservas)
  @JoinColumn({ name: 'id_paciente' })
  paciente: Usuario;

  @Column({ type: 'timestamptz' })
  fecha_hora: Date;

  @Column({
    type: 'enum',
    enum: EstadosReservas,
    enumName: 'estados_reservas_enum',
    default: EstadosReservas.ACTIVO,
  })
  estado: EstadosReservas;

  @Column({ name: 'valor_consulta', type: 'int' })
  valor_consulta: number;
}
