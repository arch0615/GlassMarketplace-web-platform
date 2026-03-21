import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('health')
  health() {
    return { status: 'admin route operational', timestamp: new Date().toISOString() };
  }

  @Get('dashboard')
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('approvals')
  getPendingApprovals() {
    return this.adminService.getPendingApprovals();
  }

  @Patch('users/:id/approve')
  approveUser(@Param('id') id: string) {
    return this.adminService.approveUser(id);
  }

  @Patch('users/:id/reject')
  rejectUser(@Param('id') id: string) {
    return this.adminService.rejectUser(id);
  }

  @Patch('users/:id/suspend')
  suspendUser(@Param('id') id: string) {
    return this.adminService.suspendUser(id);
  }

  @Get('disputes')
  listDisputes(@Query('status') status?: string) {
    return this.adminService.listDisputes(status);
  }

  @Get('requests')
  listRequests(@Query('status') status?: string) {
    return this.adminService.listRequests(status);
  }

  @Get('orders')
  listOrders(@Query('status') status?: string) {
    return this.adminService.listOrders(status);
  }
}
