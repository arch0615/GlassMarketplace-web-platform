import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UsersService } from './modules/users/users.service';
import { User } from './modules/users/user.entity';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly usersService: UsersService,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async onApplicationBootstrap() {
    await this.seedUsers();
    await this.migrateEmailVerification();
  }

  /**
   * One-time migration: mark all existing users as email-verified
   * so they are not locked out after adding the verification feature.
   */
  private async migrateEmailVerification() {
    const result = await this.usersRepository
      .createQueryBuilder()
      .update(User)
      .set({ isEmailVerified: true })
      .where('"isEmailVerified" = false AND "emailVerifyToken" IS NULL')
      .execute();

    if (result.affected && result.affected > 0) {
      this.logger.log(`[Migration] Auto-verified email for ${result.affected} existing users`);
    }
  }

  private async seedUsers() {
    const users = [
      { email: 'admin@lensia.com', fullName: 'Admin Principal', role: 'admin' },
      { email: 'cliente@lensia.com', fullName: 'María García', role: 'cliente' },
      { email: 'optica@lensia.com', fullName: 'Óptica Visión Norte', role: 'optica' },
      { email: 'medico@lensia.com', fullName: 'Dr. Carlos López', role: 'medico' },
    ];

    const hashed = await bcrypt.hash('password', 10);

    for (const u of users) {
      const existing = await this.usersService.findByEmail(u.email);
      if (existing) continue;

      await this.usersService.create({ ...u, password: hashed });
      this.logger.log(`Seeded: ${u.email} (${u.role})`);
    }
  }
}
