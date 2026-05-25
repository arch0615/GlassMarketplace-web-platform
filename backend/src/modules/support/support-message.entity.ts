import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { SupportThread } from './support-thread.entity';
import { User } from '../users/user.entity';

@Entity('support_messages')
export class SupportMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => SupportThread, { onDelete: 'CASCADE' })
  @JoinColumn()
  @Index()
  thread: SupportThread;

  @ManyToOne(() => User, { eager: true, onDelete: 'SET NULL', nullable: true })
  @JoinColumn()
  sender: User;

  @Column()
  senderRole: 'user' | 'admin';

  @Column({ type: 'text' })
  body: string;

  @Column({ nullable: true, type: 'timestamp' })
  readAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
