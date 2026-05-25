import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('prescriptions')
export class Prescription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Nullable so guests can upload a receta image before creating an
  // account. Populated when the parent request is claimed.
  @ManyToOne(() => User, { eager: true, nullable: true })
  @JoinColumn()
  client: User | null;

  @Column()
  imageUrl: string;

  @Column({ nullable: true })
  notes: string;

  @Column({ nullable: true, type: 'text' })
  aiTranscription: string;

  @Column({ default: false })
  isProcessed: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
