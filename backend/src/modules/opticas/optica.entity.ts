import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('opticas')
export class Optica {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, { eager: true })
  @JoinColumn()
  user: User;

  @Column()
  businessName: string;

  @Column({ nullable: true })
  cuit: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true, type: 'decimal' })
  lat: number;

  @Column({ nullable: true, type: 'decimal' })
  lng: number;

  @Column({ nullable: true })
  phone: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true, unique: true })
  referralCode: string;

  @Column({ nullable: true })
  referredBy: string;

  @Column({ nullable: true, type: 'timestamp' })
  discountUntil: Date;

  @Column({ nullable: true, type: 'decimal' })
  discountRate: number;

  @Column({ type: 'decimal', default: 0 })
  responseRate: number;

  @Column({ default: 0 })
  totalResponseCount: number;

  @Column({ default: 0 })
  totalRequestCount: number;

  @Column({ default: 'free' })
  subscriptionTier: string;

  @Column({ nullable: true, type: 'decimal' })
  rating: number;

  @Column({ default: 0 })
  ratingCount: number;

  @CreateDateColumn()
  createdAt: Date;
}
