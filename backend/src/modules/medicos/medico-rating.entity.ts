import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Medico } from './medico.entity';
import { User } from '../users/user.entity';

@Entity('medico_ratings')
export class MedicoRating {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Medico, { onDelete: 'CASCADE' })
  @JoinColumn()
  medico: Medico;

  @ManyToOne(() => User)
  @JoinColumn()
  client: User;

  @Column({ type: 'int' })
  score: number;

  @Column({ nullable: true })
  comment: string;

  @CreateDateColumn()
  createdAt: Date;
}
