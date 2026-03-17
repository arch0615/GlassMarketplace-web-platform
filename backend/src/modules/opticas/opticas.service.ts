import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Optica } from './optica.entity';
import { CreateOpticaDto } from './dto/create-optica.dto';
import { UpdateOpticaDto } from './dto/update-optica.dto';
import { UsersService } from '../users/users.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class OpticasService {
  constructor(
    @InjectRepository(Optica)
    private readonly opticasRepository: Repository<Optica>,
    private readonly usersService: UsersService,
  ) {}

  async findAll(): Promise<Optica[]> {
    return this.opticasRepository.find();
  }

  async findById(id: string): Promise<Optica> {
    const optica = await this.opticasRepository.findOne({ where: { id } });
    if (!optica) {
      throw new NotFoundException(`Optica with id ${id} not found`);
    }
    return optica;
  }

  async findByUserId(userId: string): Promise<Optica | null> {
    return this.opticasRepository.findOne({ where: { user: { id: userId } } });
  }

  async create(dto: CreateOpticaDto): Promise<Optica> {
    const user = await this.usersService.findById(dto.userId);
    const referralCode = uuidv4().substring(0, 8).toUpperCase();
    const optica = this.opticasRepository.create({
      user,
      businessName: dto.businessName,
      cuit: dto.cuit,
      address: dto.address,
      lat: dto.lat,
      lng: dto.lng,
      phone: dto.phone,
      referredBy: dto.referredBy,
      referralCode,
    });
    return this.opticasRepository.save(optica);
  }

  async update(id: string, dto: UpdateOpticaDto): Promise<Optica> {
    await this.findById(id);
    await this.opticasRepository.update(id, dto as any);
    return this.findById(id);
  }

  async findNearby(lat: number, lng: number, radiusKm = 10): Promise<Optica[]> {
    // Haversine approximation using bounding box + in-memory filter
    const all = await this.opticasRepository
      .createQueryBuilder('optica')
      .where('optica.lat IS NOT NULL AND optica.lng IS NOT NULL')
      .getMany();

    return all.filter((o) => {
      const dist = this.haversine(lat, lng, Number(o.lat), Number(o.lng));
      return dist <= radiusKm;
    });
  }

  private haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
}
