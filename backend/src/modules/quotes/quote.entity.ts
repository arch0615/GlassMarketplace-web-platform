import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { QuoteRequest } from '../requests/quote-request.entity';
import { Optica } from '../opticas/optica.entity';
import { QuoteFrame } from './quote-frame.entity';

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

  // 3-tier pricing
  @Column({ nullable: true, type: 'decimal' })
  tierBasicPrice: number;

  @Column({ nullable: true })
  tierBasicDesc: string;

  @Column({ nullable: true, type: 'decimal' })
  tierRecommendedPrice: number;

  @Column({ nullable: true })
  tierRecommendedDesc: string;

  @Column({ nullable: true, type: 'decimal' })
  tierPremiumPrice: number;

  @Column({ nullable: true })
  tierPremiumDesc: string;

  @Column({ nullable: true })
  selectedTier: string;

  @OneToMany(() => QuoteFrame, (qf) => qf.quote, { eager: true })
  quoteFrames: QuoteFrame[];

  @Column({ default: 'pending' })
  status: string;

  @Column({ nullable: true, type: 'timestamp' })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
