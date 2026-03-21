import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Order } from '../orders/order.entity';
import { Dispute } from '../disputes/dispute.entity';
import { QuoteRequest } from '../requests/quote-request.entity';
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
    ] = await Promise.all([
      this.usersRepository.count({
        where: { isApproved: false, isActive: true },
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
    ]);

    const usersByRole = await this.usersRepository
      .createQueryBuilder('user')
      .select('user.role', 'role')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user.role')
      .getRawMany();

    const recentOrders = await this.ordersRepository.find({
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
}
