import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Prescription } from '../prescriptions/prescription.entity';

@Entity('quote_requests')
export class QuoteRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn()
  client: User;

  @ManyToOne(() => Prescription, { eager: true, nullable: true })
  @JoinColumn()
  prescription: Prescription;

  @Column({ default: 'lentes_receta' })
  serviceType: string;

  @Column({ nullable: true })
  lensType: string;

  @Column({ nullable: true, type: 'text' })
  observations: string;

  @Column({ nullable: true })
  priceRangeMin: string;

  @Column({ nullable: true })
  priceRangeMax: string;

  @Column('simple-array', { nullable: true })
  stylePreferences: string[];

  @Column({ type: 'decimal' })
  clientLat: number;

  @Column({ type: 'decimal' })
  clientLng: number;

  @Column({ default: 'open' })
  status: string;

  @Column({ default: 0 })
  quotesReceived: number;

  @Column({ nullable: true, type: 'timestamp' })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
