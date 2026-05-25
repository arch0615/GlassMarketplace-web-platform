import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Prescription } from '../prescriptions/prescription.entity';

@Entity('quote_requests')
export class QuoteRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Nullable so anonymous (guest) requests can exist before the user
  // creates an account. Populated when the guest claims the request via
  // POST /auth/register-from-request.
  @ManyToOne(() => User, { eager: true, nullable: true })
  @JoinColumn()
  client: User | null;

  // Guest contact info — only set while client is null. Cleared when the
  // request gets claimed by a registered account.
  @Column({ nullable: true })
  guestName: string | null;

  @Column({ nullable: true })
  guestEmail: string | null;

  @Column({ nullable: true })
  guestPhone: string | null;

  // Long random token shared with the guest via email; opens the public
  // /presupuesto/:claimToken page that lets them view received quotes and
  // claim the request by registering.
  @Column({ nullable: true, unique: true })
  @Index()
  claimToken: string | null;

  @ManyToOne(() => Prescription, { eager: true, nullable: true })
  @JoinColumn()
  prescription: Prescription;

  @Column({ default: 'lentes_receta' })
  serviceType: string;

  @Column({ nullable: true })
  gender: string;

  // For receta requests — helps ópticas size the frame correctly.
  @Column({ nullable: true })
  patientType: 'nino' | 'nina' | 'adulto' | null;

  @Column({ nullable: true, type: 'int' })
  patientAge: number | null;

  @Column({ nullable: true })
  lensType: string;

  @Column({ nullable: true, type: 'text' })
  observations: string;

  // Used for non-receta service types (arreglos, lentes de contacto,
  // líquidos, otro). The user describes what they need in free text and
  // can optionally attach a photo (e.g. broken glasses, contact lens box).
  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ nullable: true })
  photoUrl: string;

  @Column({ nullable: true })
  priceRangeMin: string;

  @Column({ nullable: true })
  priceRangeMax: string;

  @Column('simple-array', { nullable: true })
  stylePreferences: string[];

  @Column({ type: 'decimal' })
  clientLat: number;

  @Column({ type: 'decimal' })
  clientLng: number;

  @Column({ default: 'open' })
  status: string;

  @Column({ default: 0 })
  quotesReceived: number;

  @Column({ nullable: true, type: 'timestamp' })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
