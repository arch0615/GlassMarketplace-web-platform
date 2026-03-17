import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './modules/users/users.service';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly usersService: UsersService) {}

  async onApplicationBootstrap() {
    await this.seedAdmin();
  }

  private async seedAdmin() {
    const adminEmail = 'admin@lensia.com';
    const existing = await this.usersService.findByEmail(adminEmail);

    if (existing) {
      this.logger.log('Admin user already exists, skipping seed.');
      return;
    }

    const hashed = await bcrypt.hash('password', 10);
    await this.usersService.create({
      email: adminEmail,
      password: hashed,
      fullName: 'Admin Principal',
      role: 'admin',
    });

    this.logger.log('Admin user seeded: admin@lensia.com');
  }
}
