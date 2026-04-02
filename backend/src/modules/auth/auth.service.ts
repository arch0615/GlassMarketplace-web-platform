import { Injectable, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { UsersService } from '../users/users.service';
import { OpticasService } from '../opticas/opticas.service';
import { MedicosService } from '../medicos/medicos.service';
import { NotificationsService } from '../notifications/notifications.service';
import { RegisterDto } from './dto/register.dto';
import { User } from '../users/user.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly opticasService: OpticasService,
    private readonly medicosService: MedicosService,
    private readonly jwtService: JwtService,
    private readonly notificationsService: NotificationsService,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  async register(dto: RegisterDto): Promise<{ access_token: string; user: Omit<User, 'password'> }> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({ ...dto, password: hashed });

    // Create role-specific profile
    if (dto.role === 'optica' && dto.businessName) {
      try {
        await this.opticasService.create({
          userId: user.id,
          businessName: dto.businessName,
          cuit: dto.cuit,
          address: dto.address,
          lat: dto.lat,
          lng: dto.lng,
          phone: dto.phone,
        });
      } catch (err) {
        this.logger.warn(`Failed to create optica profile for user ${user.id}: ${err.message}`);
      }
    } else if (dto.role === 'medico') {
      try {
        await this.medicosService.create({
          userId: user.id,
          fullName: dto.fullName,
          specialty: dto.specialty || '',
          licenseNumber: dto.licenseNumber,
        });
      } catch (err) {
        this.logger.warn(`Failed to create medico profile for user ${user.id}: ${err.message}`);
      }
    }

    const token = this.generateToken(user);
    const { password: _pw, ...userWithoutPassword } = user;
    return { access_token: token, user: userWithoutPassword as any };
  }

  async login(user: User): Promise<{ access_token: string; user: Omit<User, 'password'> }> {
    const token = this.generateToken(user);
    const { password: _pw, ...userWithoutPassword } = user;
    return { access_token: token, user: userWithoutPassword as any };
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Don't reveal whether email exists
      return { message: 'Si el email existe, recibirás un enlace para restablecer tu contraseña.' };
    }

    const resetToken = randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.usersRepository.update(user.id, { resetToken, resetTokenExpiry });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

    await this.notificationsService.sendRawEmail(
      user.email,
      'Restablecer contraseña — Lensia',
      `
        <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px">
          <h2 style="color:#1e293b;margin-bottom:16px">Restablecer contraseña</h2>
          <p style="color:#475569;font-size:14px;line-height:1.6">
            Recibimos una solicitud para restablecer la contraseña de tu cuenta en Lensia.
          </p>
          <a href="${resetLink}" style="display:inline-block;margin:24px 0;padding:12px 32px;background:#1E40AF;color:white;text-decoration:none;border-radius:12px;font-weight:600;font-size:14px">
            Restablecer contraseña
          </a>
          <p style="color:#94a3b8;font-size:12px;line-height:1.5">
            Este enlace expira en 1 hora. Si no solicitaste este cambio, podés ignorar este email.
          </p>
        </div>
      `,
    );

    this.logger.log(`Password reset email sent to ${email}`);
    return { message: 'Si el email existe, recibirás un enlace para restablecer tu contraseña.' };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const user = await this.usersRepository.findOne({ where: { resetToken: token } });

    if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      throw new BadRequestException('Token inválido o expirado.');
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.usersRepository.update(user.id, {
      password: hashed,
      resetToken: null as any,
      resetTokenExpiry: null as any,
    });

    this.logger.log(`Password reset completed for ${user.email}`);
    return { message: 'Contraseña restablecida correctamente.' };
  }

  private generateToken(user: User): string {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return this.jwtService.sign(payload);
  }
}
