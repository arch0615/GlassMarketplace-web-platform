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
    const saved = await this.opticasRepository.save(optica);

    // If referred by another optica, grant the referrer a 30-day commission discount
    if (dto.referredBy) {
      await this.applyReferralDiscount(dto.referredBy);
    }

    return saved;
  }

  async applyReferralDiscount(referralCode: string): Promise<void> {
    const referrer = await this.opticasRepository.findOne({ where: { referralCode } });
    if (!referrer) return;

    const discountDays = 30;
    const discountRate = 5; // 5% discount on commission
    const now = new Date();
    const currentEnd = referrer.discountUntil && new Date(referrer.discountUntil) > now
      ? new Date(referrer.discountUntil)
      : now;

    const newEnd = new Date(currentEnd.getTime() + discountDays * 24 * 60 * 60 * 1000);

    await this.opticasRepository.update(referrer.id, {
      discountUntil: newEnd,
      discountRate: discountRate,
    });
  }

  async getReferralInfo(opticaId: string): Promise<{ referralCode: string; referredCount: number; discountUntil: Date | null; discountRate: number }> {
    const optica = await this.findById(opticaId);
    const referredCount = await this.opticasRepository.count({ where: { referredBy: optica.referralCode } });
    return {
      referralCode: optica.referralCode,
      referredCount,
      discountUntil: optica.discountUntil,
      discountRate: Number(optica.discountRate) || 0,
    };
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
      .leftJoinAndSelect('optica.user', 'user')
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
