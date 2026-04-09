import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Quote } from './quote.entity';
import { Frame } from '../catalog/frame.entity';

@Entity('quote_frames')
export class QuoteFrame {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Quote, (q) => q.quoteFrames, { onDelete: 'CASCADE' })
  @JoinColumn()
  quote: Quote;

  @ManyToOne(() => Frame, { eager: true })
  @JoinColumn()
  frame: Frame;
}
