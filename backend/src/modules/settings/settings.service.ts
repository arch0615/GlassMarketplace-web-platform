import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlatformSetting } from './platform-setting.entity';

const DEFAULTS: Record<string, string> = {
  inner_radius_km: '5',
  outer_radius_km: '10',
  extended_radius_km: '25',
  smart_select_min: '3',
  smart_select_max: '5',
  quote_expiry_hours: '48',
  verification_window_hours: '48',
  commission_rate_pct: '0',
  referral_discount_pct: '5',
  referral_discount_days: '30',
  quote_cap: '3',
  dispute_window_days: '7',
};

@Injectable()
export class SettingsService implements OnModuleInit {
  constructor(
    @InjectRepository(PlatformSetting)
    private readonly repo: Repository<PlatformSetting>,
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  async seed(): Promise<void> {
    for (const [key, value] of Object.entries(DEFAULTS)) {
      const existing = await this.repo.findOne({ where: { key } });
      if (!existing) {
        await this.repo.save(this.repo.create({ key, value }));
      }
    }
  }

  async get(key: string): Promise<string | null> {
    const setting = await this.repo.findOne({ where: { key } });
    return setting ? setting.value : null;
  }

  async set(key: string, value: string): Promise<PlatformSetting> {
    let setting = await this.repo.findOne({ where: { key } });
    if (setting) {
      setting.value = value;
    } else {
      setting = this.repo.create({ key, value });
    }
    return this.repo.save(setting);
  }

  async getAll(): Promise<PlatformSetting[]> {
    return this.repo.find();
  }
}
