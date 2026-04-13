import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Optica } from './optica.entity';
import { User } from '../users/user.entity';
import { Order } from '../orders/order.entity';

@Entity('optica_ratings')
export class OpticaRating {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Optica, { onDelete: 'CASCADE' })
  @JoinColumn()
  optica: Optica;

  @ManyToOne(() => User)
  @JoinColumn()
  client: User;

  @ManyToOne(() => Order, { nullable: true })
  @JoinColumn()
  order: Order;

  @Column({ type: 'int' })
  score: number;

  @Column({ nullable: true })
  comment: string;

  @CreateDateColumn()
  createdAt: Date;
}
