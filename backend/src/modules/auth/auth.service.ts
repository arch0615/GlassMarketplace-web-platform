import { Injectable, ConflictException, BadRequestException, UnauthorizedException, Logger } from '@nestjs/common';
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

  async register(dto: RegisterDto): Promise<{ message: string; requiresVerification: boolean }> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({ ...dto, password: hashed });

    // Auto-approve clients — only opticas and medicos need manual approval
    if (dto.role === 'cliente' || !dto.role) {
      await this.usersRepository.update(user.id, { isApproved: true });
      user.isApproved = true;
    }

    // Create role-specific profile
    if (dto.role === 'optica') {
      try {
        await this.opticasService.create({
          userId: user.id,
          businessName: dto.businessName || user.fullName || 'Mi Óptica',
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

    // Send verification email
    await this.sendVerificationEmail(user);

    return { message: 'Registro exitoso. Revisá tu email para verificar tu cuenta.', requiresVerification: true };
  }

  async login(user: User): Promise<{ access_token: string; user: Omit<User, 'password'> }> {
    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Debés verificar tu email antes de iniciar sesión. Revisá tu bandeja de entrada.');
    }

    const token = this.generateToken(user);
    const { password: _pw, ...userWithoutPassword } = user;
    return { access_token: token, user: userWithoutPassword as any };
  }

  async verifyEmail(token: string): Promise<{ access_token: string; user: Omit<User, 'password'> }> {
    const user = await this.usersRepository.findOne({ where: { emailVerifyToken: token } });

    if (!user) {
      throw new BadRequestException('Token de verificación inválido o ya utilizado.');
    }

    await this.usersRepository.update(user.id, {
      isEmailVerified: true,
      emailVerifyToken: null as any,
    });

    user.isEmailVerified = true;
    this.logger.log(`Email verified for ${user.email}`);

    const jwtToken = this.generateToken(user);
    const { password: _pw, ...userWithoutPassword } = user;
    return { access_token: jwtToken, user: userWithoutPassword as any };
  }

  async resendVerification(email: string): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return { message: 'Si el email existe, recibirás un nuevo enlace de verificación.' };
    }
    if (user.isEmailVerified) {
      return { message: 'Tu email ya está verificado. Podés iniciar sesión.' };
    }

    await this.sendVerificationEmail(user);
    return { message: 'Si el email existe, recibirás un nuevo enlace de verificación.' };
  }

  private async sendVerificationEmail(user: User): Promise<void> {
    const verifyToken = randomBytes(32).toString('hex');
    await this.usersRepository.update(user.id, { emailVerifyToken: verifyToken });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const verifyLink = `${frontendUrl}/verify-email?token=${verifyToken}`;

    await this.notificationsService.sendRawEmail(
      user.email,
      'Verificá tu email — Lensia',
      `
        <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px">
          <div style="text-align:center;margin-bottom:24px">
            <div style="display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;background:linear-gradient(135deg,#1E40AF,#0EA5E9);border-radius:16px">
              <span style="font-size:24px;color:white">👁</span>
            </div>
          </div>
          <h2 style="color:#1e293b;margin-bottom:8px;text-align:center">¡Bienvenido a Lensia!</h2>
          <p style="color:#475569;font-size:14px;line-height:1.6;text-align:center">
            Hola <strong>${user.fullName}</strong>, gracias por registrarte. Verificá tu email para activar tu cuenta.
          </p>
          <div style="text-align:center;margin:28px 0">
            <a href="${verifyLink}" style="display:inline-block;padding:14px 40px;background:linear-gradient(135deg,#1E40AF,#0EA5E9);color:white;text-decoration:none;border-radius:14px;font-weight:700;font-size:15px;box-shadow:0 4px 12px rgba(30,64,175,0.3)">
              Verificar mi email
            </a>
          </div>
          <p style="color:#94a3b8;font-size:12px;line-height:1.5;text-align:center">
            Si no creaste esta cuenta, podés ignorar este email.
          </p>
        </div>
      `,
      { throwOnError: true },
    );

    this.logger.log(`Verification email sent to ${user.email}`);
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
