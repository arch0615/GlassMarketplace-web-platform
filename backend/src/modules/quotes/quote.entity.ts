import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { QuoteRequest } from '../requests/quote-request.entity';
import { Optica } from '../opticas/optica.entity';

@Entity('quotes')
export class Quote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => QuoteRequest, { eager: true })
  @JoinColumn()
  request: QuoteRequest;

  @ManyToOne(() => Optica, { eager: true })
  @JoinColumn()
  optica: Optica;

  @Column({ type: 'decimal' })
  totalPrice: number;

  @Column({ nullable: true })
  lensDescription: string;

  @Column({ nullable: true })
  estimatedDays: string;

  @Column({ default: 'pending' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}
