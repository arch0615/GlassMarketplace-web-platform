import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Order } from '../orders/order.entity';
import { Dispute } from '../disputes/dispute.entity';
import { QuoteRequest } from '../requests/quote-request.entity';
import { Optica } from '../opticas/optica.entity';
import { Medico } from '../medicos/medico.entity';
import { MedicoLocation } from '../medicos/medico-location.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(Dispute)
    private readonly disputesRepository: Repository<Dispute>,
    @InjectRepository(QuoteRequest)
    private readonly requestsRepository: Repository<QuoteRequest>,
    @InjectRepository(Optica)
    private readonly opticasRepository: Repository<Optica>,
    @InjectRepository(Medico)
    private readonly medicosRepository: Repository<Medico>,
    @InjectRepository(MedicoLocation)
    private readonly medicoLocationsRepository: Repository<MedicoLocation>,
    private readonly usersService: UsersService,
  ) {}

  async getDashboardStats() {
    const [totalUsers, totalOrders, totalDisputes, totalRequests] =
      await Promise.all([
        this.usersRepository.count(),
        this.ordersRepository.count(),
        this.disputesRepository.count(),
        this.requestsRepository.count(),
      ]);

    const [
      pendingApprovals,
      openDisputes,
      activeOrders,
      completedOrders,
      openRequests,
    ] = await Promise.all([
      this.usersRepository.count({
        where: [
          { isApproved: false, isActive: true, role: 'optica' as const },
          { isApproved: false, isActive: true, role: 'medico' as const },
        ],
      }),
      this.disputesRepository.count({ where: { status: 'open' } }),
      this.ordersRepository.count({
        where: [
          { status: 'payment_pending' },
          { status: 'payment_held' },
          { status: 'in_process' },
          { status: 'delivered' },
        ],
      }),
      this.ordersRepository.count({ where: { status: 'completed' } }),
      this.requestsRepository.count({ where: { status: 'open' } }),
    ]);

    const usersByRole = await this.usersRepository
      .createQueryBuilder('user')
      .select('user.role', 'role')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user.role')
      .getRawMany();

    const recentOrders = await this.ordersRepository.find({
      relations: ['client', 'optica'],
      order: { createdAt: 'DESC' },
      take: 10,
    });

    return {
      totalUsers,
      totalOrders,
      totalDisputes,
      totalRequests,
      pendingApprovals,
      openDisputes,
      openRequests,
      activeOrders,
      completedOrders,
      usersByRole,
      recentOrders,
    };
  }

  async getPendingApprovals() {
    const pendingUsers = await this.usersRepository.find({
      where: { isApproved: false, isActive: true },
      order: { createdAt: 'DESC' },
    });

    const opticas = pendingUsers.filter((u) => u.role === 'optica');
    const medicos = pendingUsers.filter((u) => u.role === 'medico');

    return { opticas, medicos };
  }

  async approveUser(id: string) {
    await this.usersService.findById(id);
    await this.usersRepository.update(id, { isApproved: true });
    return this.usersService.findById(id);
  }

  async rejectUser(id: string) {
    await this.usersService.findById(id);
    await this.usersRepository.update(id, { isApproved: false, isActive: false });
    return this.usersService.findById(id);
  }

  async suspendUser(id: string) {
    await this.usersService.findById(id);
    await this.usersRepository.update(id, { isActive: false });
    return this.usersService.findById(id);
  }

  async listDisputes(status?: string) {
    const where = status ? { status } : {};
    return this.disputesRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async listRequests(status?: string) {
    const where = status ? { status } : {};
    return this.requestsRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async listOrders(status?: string) {
    const where = status ? { status: status as any } : {};
    return this.ordersRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async listUsers(role?: string) {
    const where = role ? { role: role as any } : {};
    const users = await this.usersRepository.find({
      where,
      order: { createdAt: 'DESC' },
      select: ['id', 'email', 'fullName', 'phone', 'role', 'isApproved', 'isActive', 'createdAt'],
    });

    const opticas = await this.opticasRepository.find({ relations: ['user'] });
    const opticaMap = new Map(opticas.map((o) => [o.user.id, o]));

    const medicos = await this.medicosRepository.find({ relations: ['user'] });
    const medicoMap = new Map(medicos.map((m) => [m.user.id, m]));

    const medicoLocations = await this.medicoLocationsRepository.find({ relations: ['medico', 'medico.user'] });
    const medicoLocMap = new Map<string, any[]>();
    for (const loc of medicoLocations) {
      const mId = loc.medico?.user?.id;
      if (mId) {
        if (!medicoLocMap.has(mId)) medicoLocMap.set(mId, []);
        medicoLocMap.get(mId).push({ address: loc.address, lat: loc.lat, lng: loc.lng });
      }
    }

    return users.map((u) => {
      const base: any = { ...u };
      if (u.role === 'optica') {
        const op = opticaMap.get(u.id);
        if (op) {
          base.businessName = op.businessName;
          base.cuit = op.cuit;
          base.address = op.address;
          base.lat = op.lat;
          base.lng = op.lng;
          base.isVerified = op.isVerified;
          base.subscriptionTier = op.subscriptionTier;
          base.responseRate = op.responseRate;
        }
      } else if (u.role === 'medico') {
        const med = medicoMap.get(u.id);
        if (med) {
          base.specialty = med.specialty;
          base.licenseNumber = med.licenseNumber;
          base.obrasSociales = med.obrasSociales;
          base.isVerified = med.isVerified;
          base.locations = medicoLocMap.get(u.id) || [];
        }
      }
      return base;
    });
  }
}
