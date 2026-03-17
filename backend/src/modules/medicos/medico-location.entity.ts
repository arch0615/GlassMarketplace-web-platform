import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Medico } from './medico.entity';

@Entity('medico_locations')
export class MedicoLocation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Medico, { onDelete: 'CASCADE' })
  @JoinColumn()
  medico: Medico;

  @Column()
  address: string;

  @Column({ nullable: true, type: 'decimal' })
  lat: number;

  @Column({ nullable: true, type: 'decimal' })
  lng: number;

  @Column({ type: 'jsonb', nullable: true })
  schedule: Record<string, any>;
}
