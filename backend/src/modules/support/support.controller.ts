import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SupportService } from './support.service';
import { SendMessageDto } from './dto/send-message.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Support')
@Controller('support')
@UseGuards(JwtAuthGuard)
export class SupportController {
  constructor(private readonly support: SupportService) {}

  // ─── User endpoints (any authenticated non-admin) ─────────────────────

  @Get('me')
  async findMyThread(@CurrentUser() user: any) {
    return this.support.findMineWithMessages(user.id);
  }

  @Post('me/messages')
  async sendMyMessage(@CurrentUser() user: any, @Body() dto: SendMessageDto) {
    return this.support.sendUserMessage(user.id, dto.body);
  }

  // ─── Admin endpoints ──────────────────────────────────────────────────

  @Get('threads')
  @UseGuards(RolesGuard)
  @Roles('admin')
  listThreads(@Query('status') status?: 'open' | 'closed' | 'all') {
    return this.support.listThreadsForAdmin(status);
  }

  @Get('admin-unread-count')
  @UseGuards(RolesGuard)
  @Roles('admin')
  adminUnreadCount() {
    return this.support.getAdminUnreadSummary();
  }

  @Get('threads/:id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  getThread(@Param('id') id: string) {
    return this.support.findThreadForAdmin(id);
  }

  @Post('threads/:id/messages')
  @UseGuards(RolesGuard)
  @Roles('admin')
  reply(
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
    @CurrentUser() admin: any,
  ) {
    return this.support.sendAdminMessage(id, admin.id, dto.body);
  }

  @Patch('threads/:id/close')
  @UseGuards(RolesGuard)
  @Roles('admin')
  closeThread(@Param('id') id: string) {
    return this.support.closeThread(id);
  }
}
