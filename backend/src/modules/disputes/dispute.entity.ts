import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Order } from '../orders/order.entity';
import { User } from '../users/user.entity';

@Entity('disputes')
export class Dispute {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Order, { eager: true })
  @JoinColumn()
  order: Order;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn()
  openedBy: User;

  @Column()
  reason: string;

  @Column({ nullable: true })
  comment: string;

  @Column({ default: 'open' })
  status: string;

  @Column({ nullable: true })
  adminDecision: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
