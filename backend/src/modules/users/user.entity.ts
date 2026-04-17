import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type UserRole = 'cliente' | 'optica' | 'medico' | 'admin';

export type InvoiceCondition =
  | 'consumidor_final'
  | 'responsable_inscripto'
  | 'monotributista'
  | 'exento';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: ['cliente', 'optica', 'medico', 'admin'], default: 'cliente' })
  role: UserRole;

  @Column()
  fullName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ default: false })
  isApproved: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ nullable: true })
  emailVerifyToken: string;

  @Column({ nullable: true })
  resetToken: string;

  @Column({ nullable: true, type: 'timestamp' })
  resetTokenExpiry: Date;

  // Datos de facturación (AR)
  @Column({ nullable: true })
  cuit: string | null;

  @Column({ nullable: true })
  razonSocial: string | null;

  @Column({
    type: 'enum',
    enum: ['consumidor_final', 'responsable_inscripto', 'monotributista', 'exento'],
    nullable: true,
  })
  invoiceCondition: InvoiceCondition | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
