import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prescription } from './prescription.entity';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class PrescriptionsService {
  constructor(
    @InjectRepository(Prescription)
    private readonly prescriptionsRepository: Repository<Prescription>,
    private readonly usersService: UsersService,
  ) {}

  async create(
    clientId: string,
    dto: CreatePrescriptionDto,
    imageUrl: string,
  ): Promise<Prescription> {
    const client = await this.usersService.findById(clientId);
    const prescription = this.prescriptionsRepository.create({
      client,
      imageUrl,
      notes: dto.notes,
    });
    return this.prescriptionsRepository.save(prescription);
  }

  async findByClient(clientId: string): Promise<Prescription[]> {
    return this.prescriptionsRepository.find({
      where: { client: { id: clientId } },
      order: { createdAt: 'DESC' },
    });
  }

  async updateTranscription(id: string, transcription: string): Promise<void> {
    await this.prescriptionsRepository.update(id, { aiTranscription: transcription });
  }

  async findById(id: string): Promise<Prescription> {
    const prescription = await this.prescriptionsRepository.findOne({ where: { id } });
    if (!prescription) {
      throw new NotFoundException(`Prescription with id ${id} not found`);
    }
    return prescription;
  }
}
