import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Dispute } from './dispute.entity';
import { User } from '../users/user.entity';

@Entity('dispute_messages')
export class DisputeMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Dispute, { onDelete: 'CASCADE' })
  @JoinColumn()
  dispute: Dispute;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn()
  sender: User;

  @Column()
  senderRole: string;

  @Column('text')
  message: string;

  @CreateDateColumn()
  createdAt: Date;
}
