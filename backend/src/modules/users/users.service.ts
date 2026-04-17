import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findAll(role?: string): Promise<User[]> {
    if (role) {
      return this.usersRepository.find({ where: { role: role as any } });
    }
    return this.usersRepository.find();
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async create(dto: CreateUserDto): Promise<User> {
    const partial: Partial<User> = {
      email: dto.email,
      password: dto.password,
      fullName: dto.fullName,
      phone: dto.phone,
      cuit: dto.cuit ?? null,
      razonSocial: dto.razonSocial ?? null,
      invoiceCondition: dto.invoiceCondition ?? null,
      ...(dto.role ? { role: dto.role as any } : {}),
    };
    const user = this.usersRepository.create(partial);
    return this.usersRepository.save(user);
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    await this.findById(id);
    await this.usersRepository.update(id, dto as any);
    return this.findById(id);
  }
}
