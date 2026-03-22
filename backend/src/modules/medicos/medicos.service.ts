import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Medico } from './medico.entity';
import { MedicoRating } from './medico-rating.entity';
import { CreateMedicoDto } from './dto/create-medico.dto';
import { UpdateMedicoDto } from './dto/update-medico.dto';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class MedicosService {
  constructor(
    @InjectRepository(Medico)
    private readonly medicosRepository: Repository<Medico>,
    @InjectRepository(MedicoRating)
    private readonly ratingsRepository: Repository<MedicoRating>,
    private readonly usersService: UsersService,
  ) {}

  async findAll(): Promise<Medico[]> {
    return this.medicosRepository.find();
  }

  async findById(id: string): Promise<Medico> {
    const medico = await this.medicosRepository.findOne({ where: { id } });
    if (!medico) {
      throw new NotFoundException(`Medico with id ${id} not found`);
    }
    return medico;
  }

  async create(dto: CreateMedicoDto): Promise<Medico> {
    const user = await this.usersService.findById(dto.userId);
    const medico = this.medicosRepository.create({
      user,
      fullName: dto.fullName,
      specialty: dto.specialty,
      licenseNumber: dto.licenseNumber,
      obrasSociales: dto.obrasSociales,
    });
    return this.medicosRepository.save(medico);
  }

  async findByUserId(userId: string): Promise<Medico> {
    const medico = await this.medicosRepository.findOne({ where: { user: { id: userId } } });
    if (!medico) {
      throw new NotFoundException('Medico profile not found for this user');
    }
    return medico;
  }

  async updateByUserId(userId: string, dto: UpdateMedicoDto): Promise<Medico> {
    const medico = await this.findByUserId(userId);
    await this.medicosRepository.update(medico.id, dto as any);
    return this.findById(medico.id);
  }

  async update(id: string, dto: UpdateMedicoDto): Promise<Medico> {
    await this.findById(id);
    await this.medicosRepository.update(id, dto as any);
    return this.findById(id);
  }

  async addRating(medicoId: string, clientId: string, dto: CreateRatingDto): Promise<MedicoRating> {
    const medico = await this.findById(medicoId);
    const client = await this.usersService.findById(clientId);

    const rating = this.ratingsRepository.create({
      medico,
      client,
      score: dto.score,
      comment: dto.comment,
    });
    await this.ratingsRepository.save(rating);

    // Recalculate average rating
    const ratings = await this.ratingsRepository.find({ where: { medico: { id: medicoId } } });
    const avg = ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length;
    await this.medicosRepository.update(medicoId, { rating: avg, ratingCount: ratings.length });

    return rating;
  }
}
