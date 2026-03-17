import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Dispute } from './dispute.entity';

@Entity('dispute_photos')
export class DisputePhoto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Dispute, { onDelete: 'CASCADE' })
  @JoinColumn()
  dispute: Dispute;

  @Column()
  imageUrl: string;

  @CreateDateColumn()
  createdAt: Date;
}
