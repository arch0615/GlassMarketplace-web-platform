import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Frame } from './frame.entity';
import { CreateFrameDto } from './dto/create-frame.dto';
import { UpdateFrameDto } from './dto/update-frame.dto';
import { OpticasService } from '../opticas/opticas.service';

@Injectable()
export class CatalogService {
  constructor(
    @InjectRepository(Frame)
    private readonly framesRepository: Repository<Frame>,
    private readonly opticasService: OpticasService,
  ) {}

  async findByOptica(opticaId: string): Promise<Frame[]> {
    return this.framesRepository.find({
      where: { optica: { id: opticaId }, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Frame> {
    const frame = await this.framesRepository.findOne({ where: { id } });
    if (!frame) {
      throw new NotFoundException(`Frame with id ${id} not found`);
    }
    return frame;
  }

  async create(dto: CreateFrameDto): Promise<Frame> {
    const optica = await this.opticasService.findById(dto.opticaId);
    const frame = this.framesRepository.create({
      optica,
      brand: dto.brand,
      model: dto.model,
      material: dto.material,
      color: dto.color,
      priceMin: dto.priceMin,
      priceMax: dto.priceMax,
      styleTags: dto.styleTags,
      arReady: dto.arReady,
      arAssetUrl: dto.arAssetUrl,
      imageUrl: dto.imageUrl,
    });
    return this.framesRepository.save(frame);
  }

  async update(id: string, dto: UpdateFrameDto): Promise<Frame> {
    await this.findById(id);
    await this.framesRepository.update(id, dto as any);
    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await this.framesRepository.update(id, { isActive: false });
  }
}
