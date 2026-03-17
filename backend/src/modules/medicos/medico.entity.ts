import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('medicos')
export class Medico {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, { eager: true })
  @JoinColumn()
  user: User;

  @Column()
  fullName: string;

  @Column()
  specialty: string;

  @Column({ nullable: true })
  licenseNumber: string;

  @Column('simple-array', { nullable: true })
  obrasSociales: string[];

  @Column({ nullable: true, type: 'decimal' })
  rating: number;

  @Column({ default: 0 })
  ratingCount: number;

  @Column({ default: false })
  isVerified: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
