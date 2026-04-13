import { Injectable, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(AdminService.name);

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

    // Commission totals
    const commissionRow = await this.ordersRepository
      .createQueryBuilder('o')
      .select('COALESCE(SUM(o."commissionAmount"), 0)', 'total')
      .where('o.status = :status', { status: 'completed' })
      .getRawOne();
    const totalCommissionsEarned = Number(commissionRow?.total || 0);

    const pendingCommissionRow = await this.ordersRepository
      .createQueryBuilder('o')
      .select('COALESCE(SUM(o."commissionAmount"), 0)', 'total')
      .where('o.status IN (:...statuses)', { statuses: ['payment_held', 'in_process', 'delivered'] })
      .getRawOne();
    const pendingCommissions = Number(pendingCommissionRow?.total || 0);

    const totalRevenueRow = await this.ordersRepository
      .createQueryBuilder('o')
      .select('COALESCE(SUM(o.amount), 0)', 'total')
      .where('o.status = :status', { status: 'completed' })
      .getRawOne();
    const totalRevenueProcessed = Number(totalRevenueRow?.total || 0);

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
      totalCommissionsEarned,
      pendingCommissions,
      totalRevenueProcessed,
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
    const user = await this.usersService.findById(id);
    await this.usersRepository.update(id, { isApproved: true });

    // Also mark the role-specific profile as verified
    if (user.role === 'optica') {
      const optica = await this.opticasRepository.findOne({ where: { user: { id } } });
      if (optica) {
        await this.opticasRepository.update(optica.id, { isVerified: true });
      }
    } else if (user.role === 'medico') {
      const medico = await this.medicosRepository.findOne({ where: { user: { id } } });
      if (medico) {
        await this.medicosRepository.update(medico.id, { isVerified: true });
      }
    }

    return this.usersService.findById(id);
  }

  async rejectUser(id: string) {
    const user = await this.usersService.findById(id);
    await this.usersRepository.update(id, { isApproved: false, isActive: false });

    // Also mark the role-specific profile as not verified
    if (user.role === 'optica') {
      const optica = await this.opticasRepository.findOne({ where: { user: { id } } });
      if (optica) {
        await this.opticasRepository.update(optica.id, { isVerified: false });
      }
    } else if (user.role === 'medico') {
      const medico = await this.medicosRepository.findOne({ where: { user: { id } } });
      if (medico) {
        await this.medicosRepository.update(medico.id, { isVerified: false });
      }
    }

    return this.usersService.findById(id);
  }

  async suspendUser(id: string) {
    await this.usersService.findById(id);
    await this.usersRepository.update(id, { isActive: false });
    return this.usersService.findById(id);
  }

  async listDisputes(status?: string) {
    if (!status) {
      return this.disputesRepository.find({
        order: { createdAt: 'DESC' },
      });
    }
    // Allow comma-separated multiple statuses
    const statuses = status.split(',').map((s) => s.trim()).filter(Boolean);
    return this.disputesRepository
      .createQueryBuilder('d')
      .where('d.status IN (:...statuses)', { statuses })
      .orderBy('d.createdAt', 'DESC')
      .getMany();
  }

  async listRequests(status?: string) {
    const where = status ? { status } : {};
    return this.requestsRepository.find({
      where,
      relations: ['client', 'prescription'],
      order: { createdAt: 'DESC' },
    });
  }

  async listOrders(status?: string) {
    const where = status ? { status: status as any } : {};
    return this.ordersRepository.find({
      where,
      relations: ['client', 'optica'],
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

  /**
   * One-time sync: auto-approve all clients, auto-verify emails for existing users,
   * and sync isVerified for opticas/medicos whose User.isApproved is already true.
   */
  async syncApprovals(): Promise<{ clientsApproved: number; opticasVerified: number; medicosVerified: number; emailsVerified: number }> {
    // 0. Auto-verify emails for all existing users (migration for new isEmailVerified field)
    const emailResult = await this.usersRepository
      .createQueryBuilder()
      .update(User)
      .set({ isEmailVerified: true })
      .where('"isEmailVerified" = false')
      .execute();

    // 1. Auto-approve all clients
    const clientResult = await this.usersRepository
      .createQueryBuilder()
      .update(User)
      .set({ isApproved: true })
      .where('role = :role AND "isApproved" = false', { role: 'cliente' })
      .execute();

    // 2. Sync optica isVerified with user isApproved
    const approvedOpticaUsers = await this.usersRepository.find({
      where: { role: 'optica' as any, isApproved: true },
    });
    let opticasVerified = 0;
    for (const u of approvedOpticaUsers) {
      const optica = await this.opticasRepository.findOne({ where: { user: { id: u.id } } });
      if (optica && !optica.isVerified) {
        await this.opticasRepository.update(optica.id, { isVerified: true });
        opticasVerified++;
      }
    }

    // 3. Sync medico isVerified with user isApproved
    const approvedMedicoUsers = await this.usersRepository.find({
      where: { role: 'medico' as any, isApproved: true },
    });
    let medicosVerified = 0;
    for (const u of approvedMedicoUsers) {
      const medico = await this.medicosRepository.findOne({ where: { user: { id: u.id } } });
      if (medico && !medico.isVerified) {
        await this.medicosRepository.update(medico.id, { isVerified: true });
        medicosVerified++;
      }
    }

    this.logger.log(
      `[Sync] Emails verified: ${emailResult.affected}, Clients approved: ${clientResult.affected}, Opticas verified: ${opticasVerified}, Medicos verified: ${medicosVerified}`,
    );

    return {
      clientsApproved: clientResult.affected || 0,
      opticasVerified,
      medicosVerified,
      emailsVerified: emailResult.affected || 0,
    };
  }
}
