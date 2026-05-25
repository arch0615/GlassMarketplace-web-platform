import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../users/user.entity';

/**
 * One thread per non-admin user. All admins share the same inbox and
 * collaborate on the same thread row. Created lazily the first time the
 * user opens the support panel or sends a message.
 */
@Entity('support_threads')
export class SupportThread {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn()
  @Index()
  user: User;

  @Column({ default: 'open' })
  status: 'open' | 'closed';

  @Column({ nullable: true, type: 'timestamp' })
  lastMessageAt: Date;

  // Number of admin → user messages the user hasn't seen yet.
  @Column({ default: 0 })
  unreadForUser: number;

  // Number of user → admin messages no admin has marked as read.
  @Column({ default: 0 })
  unreadForAdmin: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
