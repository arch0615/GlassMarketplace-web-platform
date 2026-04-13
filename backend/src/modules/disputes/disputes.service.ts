import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dispute } from './dispute.entity';
import { DisputeMessage } from './dispute-message.entity';
import { DisputePhoto } from './dispute-photo.entity';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { AddMessageDto } from './dto/add-message.dto';
import { ResolveDisputeDto } from './dto/resolve-dispute.dto';
import { OrdersService } from '../orders/orders.service';
import { UsersService } from '../users/users.service';
import { PaymentsService } from '../payments/payments.service';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class DisputesService {
  constructor(
    @InjectRepository(Dispute)
    private readonly disputesRepository: Repository<Dispute>,
    @InjectRepository(DisputeMessage)
    private readonly messagesRepository: Repository<DisputeMessage>,
    @InjectRepository(DisputePhoto)
    private readonly photosRepository: Repository<DisputePhoto>,
    private readonly ordersService: OrdersService,
    private readonly usersService: UsersService,
    private readonly paymentsService: PaymentsService,
    private readonly settingsService: SettingsService,
  ) {}

  async create(dto: CreateDisputeDto, openedById: string, photoUrls?: string[]): Promise<Dispute> {
    const order = await this.ordersService.findById(dto.orderId);

    // Enforce dispute window
    if (order.deliveredAt) {
      const windowDays = parseInt(
        (await this.settingsService.get('dispute_window_days')) || '7',
        10,
      );
      const deadline = new Date(order.deliveredAt.getTime() + windowDays * 24 * 60 * 60 * 1000);
      if (new Date() > deadline) {
        throw new BadRequestException(
          `The dispute window for this order has expired (${windowDays} days after delivery)`,
        );
      }
    }

    const openedBy = await this.usersService.findById(openedById);

    // Mark order as in dispute
    await this.ordersService.updateStatus(dto.orderId, 'dispute', `Dispute opened: ${dto.reason}`);

    const dispute = this.disputesRepository.create({
      order,
      openedBy,
      reason: dto.reason,
      comment: dto.comment,
    });
    const savedDispute = await this.disputesRepository.save(dispute);

    // Save dispute photos if provided
    if (photoUrls && photoUrls.length > 0) {
      for (const imageUrl of photoUrls) {
        const photo = this.photosRepository.create({ dispute: savedDispute, imageUrl });
        await this.photosRepository.save(photo);
      }
    }

    return savedDispute;
  }

  async findByUser(userId: string): Promise<Dispute[]> {
    return this.disputesRepository.find({
      where: { openedBy: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async findAll(status?: string): Promise<Dispute[]> {
    const where = status ? { status } : {};
    return this.disputesRepository.find({ where, order: { createdAt: 'DESC' } });
  }

  async findById(id: string): Promise<any> {
    const dispute = await this.disputesRepository.findOne({ where: { id } });
    if (!dispute) {
      throw new NotFoundException(`Dispute with id ${id} not found`);
    }
    const messages = await this.messagesRepository.find({
      where: { dispute: { id } },
      order: { createdAt: 'ASC' },
    });
    // Flatten: return dispute fields + messages array for easier frontend consumption
    return { ...dispute, messages };
  }

  async findByOrderId(orderId: string): Promise<any | null> {
    const dispute = await this.disputesRepository.findOne({
      where: { order: { id: orderId } },
      order: { createdAt: 'DESC' },
    });
    if (!dispute) return null;
    const messages = await this.messagesRepository.find({
      where: { dispute: { id: dispute.id } },
      order: { createdAt: 'ASC' },
    });
    return { ...dispute, messages };
  }

  async addMessage(
    disputeId: string,
    senderId: string,
    dto: AddMessageDto,
  ): Promise<DisputeMessage> {
    const dispute = await this.disputesRepository.findOne({ where: { id: disputeId } });
    if (!dispute) {
      throw new NotFoundException(`Dispute with id ${disputeId} not found`);
    }
    if (dispute.status !== 'open') {
      throw new BadRequestException('Cannot add messages to a closed dispute');
    }

    const sender = await this.usersService.findById(senderId);
    const message = this.messagesRepository.create({
      dispute,
      sender,
      senderRole: sender.role,
      message: dto.message,
    });

    return this.messagesRepository.save(message);
  }

  async resolve(
    disputeId: string,
    dto: ResolveDisputeDto,
  ): Promise<Dispute> {
    const dispute = await this.disputesRepository.findOne({ where: { id: disputeId } });
    if (!dispute) {
      throw new NotFoundException(`Dispute with id ${disputeId} not found`);
    }
    if (!['open', 'correction', 'correction_done'].includes(dispute.status)) {
      throw new BadRequestException('Dispute is already resolved');
    }

    const statusMap: Record<string, string> = {
      release: 'resolved',
      refund: 'refunded',
      correction: 'correction',
    };
    const newStatus = statusMap[dto.decision];

    await this.disputesRepository.update(disputeId, {
      status: newStatus,
      adminDecision: dto.adminDecision,
    });

    // Execute payment action
    if (dto.decision === 'release') {
      await this.paymentsService.releasePayment(dispute.order.id);
      await this.ordersService.updateStatus(dispute.order.id, 'completed', 'Resolved by admin: released');
    } else if (dto.decision === 'refund') {
      await this.paymentsService.refundPayment(dispute.order.id);
      await this.ordersService.updateStatus(dispute.order.id, 'refunded', 'Resolved by admin: refunded');
    }
    // For 'correction', the order stays in dispute status — it's not closed yet

    // Add a system message to the chat
    if (dto.decision === 'correction') {
      const systemMsg = this.messagesRepository.create({
        dispute,
        sender: dispute.openedBy,
        senderRole: 'admin',
        message: `[Sistema] El administrador solicitó a la óptica que realice una corrección. ${dto.adminDecision || ''}`,
      });
      await this.messagesRepository.save(systemMsg);
    }

    return this.disputesRepository.findOne({ where: { id: disputeId } }) as Promise<Dispute>;
  }

  async markCorrected(disputeId: string, opticaUserId: string): Promise<Dispute> {
    const dispute = await this.disputesRepository.findOne({ where: { id: disputeId } });
    if (!dispute) {
      throw new NotFoundException(`Dispute with id ${disputeId} not found`);
    }
    if (dispute.status !== 'correction') {
      throw new BadRequestException('Solo se puede marcar como corregido cuando la disputa está en corrección');
    }

    // Verify the optica is the one in the order
    const order = await this.ordersService.findById(dispute.order.id);
    if (order.optica?.user?.id !== opticaUserId) {
      throw new BadRequestException('No autorizado para esta disputa');
    }

    await this.disputesRepository.update(disputeId, { status: 'correction_done' });

    // System message
    const sender = await this.usersService.findById(opticaUserId);
    const systemMsg = this.messagesRepository.create({
      dispute,
      sender,
      senderRole: 'optica',
      message: `[Sistema] La óptica marcó la corrección como completada. Esperando confirmación del cliente.`,
    });
    await this.messagesRepository.save(systemMsg);

    return this.disputesRepository.findOne({ where: { id: disputeId } }) as Promise<Dispute>;
  }

  async confirmCorrection(disputeId: string, clientId: string): Promise<Dispute> {
    const dispute = await this.disputesRepository.findOne({ where: { id: disputeId } });
    if (!dispute) {
      throw new NotFoundException(`Dispute with id ${disputeId} not found`);
    }
    if (dispute.status !== 'correction_done') {
      throw new BadRequestException('La óptica todavía no marcó la corrección como completada');
    }
    if (dispute.openedBy?.id !== clientId) {
      throw new BadRequestException('Solo el cliente que abrió la disputa puede confirmar');
    }

    await this.disputesRepository.update(disputeId, { status: 'resolved' });
    await this.paymentsService.releasePayment(dispute.order.id);
    await this.ordersService.updateStatus(dispute.order.id, 'completed', 'Cliente confirmó la corrección');

    // System message
    const sender = await this.usersService.findById(clientId);
    const systemMsg = this.messagesRepository.create({
      dispute,
      sender,
      senderRole: 'cliente',
      message: `[Sistema] El cliente confirmó la corrección. Disputa cerrada y pago liberado a la óptica.`,
    });
    await this.messagesRepository.save(systemMsg);

    return this.disputesRepository.findOne({ where: { id: disputeId } }) as Promise<Dispute>;
  }

  async rejectCorrection(disputeId: string, clientId: string, reason: string): Promise<Dispute> {
    const dispute = await this.disputesRepository.findOne({ where: { id: disputeId } });
    if (!dispute) {
      throw new NotFoundException(`Dispute with id ${disputeId} not found`);
    }
    if (dispute.status !== 'correction_done') {
      throw new BadRequestException('No se puede rechazar en este estado');
    }
    if (dispute.openedBy?.id !== clientId) {
      throw new BadRequestException('Solo el cliente que abrió la disputa puede rechazar');
    }

    // Re-open the dispute back to 'open'
    await this.disputesRepository.update(disputeId, { status: 'open' });

    const sender = await this.usersService.findById(clientId);
    const systemMsg = this.messagesRepository.create({
      dispute,
      sender,
      senderRole: 'cliente',
      message: `[Sistema] El cliente rechazó la corrección. Motivo: ${reason || 'no especificado'}. La disputa vuelve a estar abierta.`,
    });
    await this.messagesRepository.save(systemMsg);

    return this.disputesRepository.findOne({ where: { id: disputeId } }) as Promise<Dispute>;
  }
}
