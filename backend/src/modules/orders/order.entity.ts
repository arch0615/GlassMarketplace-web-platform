import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Quote } from '../quotes/quote.entity';
import { User } from '../users/user.entity';
import { Optica } from '../opticas/optica.entity';
import { Frame } from '../catalog/frame.entity';

export type OrderStatus =
  | 'payment_pending'
  | 'payment_held'
  | 'in_process'
  | 'delivered'
  | 'completed'
  | 'dispute'
  | 'refunded'
  | 'cancelled';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Quote, { eager: true })
  @JoinColumn()
  quote: Quote;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn()
  client: User;

  @ManyToOne(() => Optica, { eager: true })
  @JoinColumn()
  optica: Optica;

  @ManyToOne(() => Frame, { nullable: true, eager: true })
  @JoinColumn()
  selectedFrame: Frame;

  @Column({ default: 'payment_pending' })
  status: OrderStatus;

  @Column({ nullable: true, type: 'decimal' })
  amount: number;

  @Column({ nullable: true, type: 'decimal' })
  commissionAmount: number;

  @Column({ nullable: true })
  mpPaymentId: string;

  @Column({ nullable: true, type: 'timestamp' })
  paymentDeadline: Date;

  @Column({ nullable: true, type: 'timestamp' })
  deliveredAt: Date;

  @Column({ nullable: true, type: 'timestamp' })
  verificationDeadline: Date;

  @Column({ nullable: true, type: 'timestamp' })
  completedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
