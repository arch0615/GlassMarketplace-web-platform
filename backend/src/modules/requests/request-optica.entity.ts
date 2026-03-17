import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { QuoteRequest } from './quote-request.entity';
import { Optica } from '../opticas/optica.entity';

export type RequestOpticaStatus = 'pending' | 'responded' | 'expired' | 'ignored';

@Entity('request_opticas')
export class RequestOptica {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => QuoteRequest, { onDelete: 'CASCADE' })
  @JoinColumn()
  request: QuoteRequest;

  @ManyToOne(() => Optica, { eager: true })
  @JoinColumn()
  optica: Optica;

  @Column({ default: 'pending' })
  status: RequestOpticaStatus;

  @CreateDateColumn()
  createdAt: Date;
}
