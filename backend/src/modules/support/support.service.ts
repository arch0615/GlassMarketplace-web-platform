import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { SupportThread } from './support-thread.entity';
import { SupportMessage } from './support-message.entity';
import { User } from '../users/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class SupportService {
  private readonly logger = new Logger(SupportService.name);

  // Per-thread cooldown for admin "you have a new message" emails to avoid
  // blasting admins when a user sends a burst of messages.
  private readonly adminNotifyCooldownMs = 10 * 60 * 1000;
  private readonly lastAdminNotifyAt = new Map<string, number>();

  constructor(
    @InjectRepository(SupportThread)
    private readonly threadsRepo: Repository<SupportThread>,
    @InjectRepository(SupportMessage)
    private readonly messagesRepo: Repository<SupportMessage>,
    private readonly notifications: NotificationsService,
    private readonly usersService: UsersService,
  ) {}

  /** Get or create the user's support thread. */
  async getOrCreateForUser(userId: string): Promise<SupportThread> {
    let thread = await this.threadsRepo.findOne({
      where: { user: { id: userId } },
    });
    if (!thread) {
      const user = await this.usersService.findById(userId);
      thread = this.threadsRepo.create({ user, status: 'open' });
      thread = await this.threadsRepo.save(thread);
    }
    return thread;
  }

  /** Fetch the user's thread plus full message history. */
  async findMineWithMessages(userId: string) {
    const thread = await this.getOrCreateForUser(userId);
    const messages = await this.messagesRepo.find({
      where: { thread: { id: thread.id } },
      order: { createdAt: 'ASC' },
    });

    // Mark admin → user messages as read.
    const unread = messages.filter((m) => m.senderRole === 'admin' && !m.readAt);
    if (unread.length) {
      const now = new Date();
      await this.messagesRepo.update(
        { id: In(unread.map((m) => m.id)) } as any,
        { readAt: now },
      );
      await this.threadsRepo.update(thread.id, { unreadForUser: 0 });
      thread.unreadForUser = 0;
    }

    return { thread, messages };
  }

  /** User sends a message to admins. */
  async sendUserMessage(userId: string, body: string): Promise<SupportMessage> {
    const trimmed = body.trim();
    if (!trimmed) {
      throw new NotFoundException('El mensaje no puede estar vacío.');
    }
    const thread = await this.getOrCreateForUser(userId);
    if (thread.status === 'closed') {
      // Reopen on new message.
      await this.threadsRepo.update(thread.id, { status: 'open' });
      thread.status = 'open';
    }

    const sender = await this.usersService.findById(userId);
    const msg = this.messagesRepo.create({
      thread,
      sender,
      senderRole: 'user',
      body: trimmed,
    });
    const saved = await this.messagesRepo.save(msg);

    await this.threadsRepo.update(thread.id, {
      lastMessageAt: saved.createdAt,
      unreadForAdmin: (thread.unreadForAdmin || 0) + 1,
    });

    // Best-effort admin notification (debounced per thread).
    this.notifyAdminsAboutNewUserMessage(thread.id, sender, trimmed).catch(
      (err) => this.logger.warn(`Admin notify failed: ${err.message}`),
    );

    return saved;
  }

  /** Admin lists all threads, ordered by most recent activity. */
  async listThreadsForAdmin(filter?: 'open' | 'closed' | 'all') {
    const where = filter && filter !== 'all' ? { status: filter } : {};
    const threads = await this.threadsRepo.find({
      where,
      order: { lastMessageAt: 'DESC', createdAt: 'DESC' },
      take: 200,
    });
    return threads;
  }

  /**
   * Lightweight count of open threads with unread messages for the admin.
   * Used by the admin sidebar polling loop to show a red dot on the
   * "Soporte" link without paying the cost of fetching every thread.
   */
  async getAdminUnreadSummary(): Promise<{ unreadThreads: number; unreadMessages: number }> {
    const rows = await this.threadsRepo
      .createQueryBuilder('t')
      .select('COUNT(*)', 'unreadThreads')
      .addSelect('COALESCE(SUM(t."unreadForAdmin"), 0)', 'unreadMessages')
      .where('t."unreadForAdmin" > 0')
      .andWhere(`t.status = 'open'`)
      .getRawOne();
    return {
      unreadThreads: Number(rows?.unreadThreads || 0),
      unreadMessages: Number(rows?.unreadMessages || 0),
    };
  }

  /** Admin opens a thread; load messages + mark user→admin msgs as read. */
  async findThreadForAdmin(threadId: string) {
    const thread = await this.threadsRepo.findOne({ where: { id: threadId } });
    if (!thread) throw new NotFoundException('Thread no encontrado');

    const messages = await this.messagesRepo.find({
      where: { thread: { id: thread.id } },
      order: { createdAt: 'ASC' },
    });

    const unread = messages.filter((m) => m.senderRole === 'user' && !m.readAt);
    if (unread.length) {
      const now = new Date();
      await this.messagesRepo.update(
        { id: In(unread.map((m) => m.id)) } as any,
        { readAt: now },
      );
      await this.threadsRepo.update(thread.id, { unreadForAdmin: 0 });
      thread.unreadForAdmin = 0;
    }

    return { thread, messages };
  }

  /** Admin replies in a thread. */
  async sendAdminMessage(
    threadId: string,
    adminId: string,
    body: string,
  ): Promise<SupportMessage> {
    const trimmed = body.trim();
    if (!trimmed) {
      throw new NotFoundException('El mensaje no puede estar vacío.');
    }
    const thread = await this.threadsRepo.findOne({ where: { id: threadId } });
    if (!thread) throw new NotFoundException('Thread no encontrado');

    const admin = await this.usersService.findById(adminId);
    if (admin.role !== 'admin') {
      throw new ForbiddenException('Sólo administradores pueden responder aquí.');
    }

    const msg = this.messagesRepo.create({
      thread,
      sender: admin,
      senderRole: 'admin',
      body: trimmed,
    });
    const saved = await this.messagesRepo.save(msg);

    await this.threadsRepo.update(thread.id, {
      lastMessageAt: saved.createdAt,
      unreadForUser: (thread.unreadForUser || 0) + 1,
      status: 'open',
    });

    // Notify the user by email that admin replied (best-effort).
    this.notifyUserAboutAdminReply(thread, admin, trimmed).catch((err) =>
      this.logger.warn(`User notify failed: ${err.message}`),
    );

    return saved;
  }

  /** Admin closes a thread (user can still re-open by sending a new msg). */
  async closeThread(threadId: string): Promise<SupportThread> {
    const thread = await this.threadsRepo.findOne({ where: { id: threadId } });
    if (!thread) throw new NotFoundException('Thread no encontrado');
    await this.threadsRepo.update(thread.id, { status: 'closed' });
    return { ...thread, status: 'closed' };
  }

  private async notifyAdminsAboutNewUserMessage(
    threadId: string,
    sender: User,
    body: string,
  ): Promise<void> {
    const last = this.lastAdminNotifyAt.get(threadId) || 0;
    if (Date.now() - last < this.adminNotifyCooldownMs) return;
    this.lastAdminNotifyAt.set(threadId, Date.now());

    const admins = await this.usersService.findAll('admin');
    const preview = body.length > 140 ? body.slice(0, 140) + '…' : body;
    const html = `
      <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#1E40AF">Nuevo mensaje de soporte — Lensia</h2>
        <p><strong>${sender.fullName || sender.email}</strong> (${sender.role}) escribió:</p>
        <blockquote style="margin:0 0 16px 0;padding:12px 16px;background:#F8FAFC;border-left:4px solid #1E40AF;border-radius:8px;color:#334155;white-space:pre-wrap">
          ${this.escapeHtml(preview)}
        </blockquote>
        <p style="color:#64748B;font-size:13px">Ingresá al panel de soporte para responder.</p>
      </div>
    `;
    for (const a of admins) {
      if (!a.email) continue;
      await this.notifications.sendRawEmail(
        a.email,
        'Lensia · Nuevo mensaje de soporte',
        html,
      );
    }
  }

  private async notifyUserAboutAdminReply(
    thread: SupportThread,
    admin: User,
    body: string,
  ): Promise<void> {
    if (!thread.user?.email) return;
    const preview = body.length > 200 ? body.slice(0, 200) + '…' : body;
    const html = `
      <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#1E40AF">Soporte Lensia respondió</h2>
        <p>Hola ${thread.user.fullName || ''}, recibiste una respuesta del equipo de soporte:</p>
        <blockquote style="margin:0 0 16px 0;padding:12px 16px;background:#F8FAFC;border-left:4px solid #1E40AF;border-radius:8px;color:#334155;white-space:pre-wrap">
          ${this.escapeHtml(preview)}
        </blockquote>
        <p style="color:#64748B;font-size:13px">Ingresá a tu panel y abrí el chat de soporte para ver la conversación completa.</p>
      </div>
    `;
    await this.notifications.sendRawEmail(
      thread.user.email,
      'Lensia · Soporte respondió tu mensaje',
      html,
    );
  }

  private escapeHtml(s: string): string {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}

