import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Optica } from '../opticas/optica.entity';

@Entity('frames')
export class Frame {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Optica, { eager: true })
  @JoinColumn()
  optica: Optica;

  @Column()
  brand: string;

  @Column()
  model: string;

  @Column({ nullable: true })
  material: string;

  @Column({ nullable: true })
  color: string;

  @Column({ nullable: true, type: 'decimal' })
  priceMin: number;

  @Column({ nullable: true, type: 'decimal' })
  priceMax: number;

  @Column('simple-array', { nullable: true })
  styleTags: string[];

  @Column({ default: false })
  arReady: boolean;

  @Column({ nullable: true })
  arAssetUrl: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
