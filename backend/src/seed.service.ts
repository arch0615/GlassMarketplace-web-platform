import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './modules/users/users.service';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly usersService: UsersService) {}

  async onApplicationBootstrap() {
    await this.seedUsers();
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
