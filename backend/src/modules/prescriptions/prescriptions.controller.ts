import {
  Controller,
  Post,
  Get,
  Body,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('prescriptions')
@UseGuards(JwtAuthGuard)
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() dto: CreatePrescriptionDto,
    @UploadedFile() file: any,
    @CurrentUser() user: any,
  ) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    // Placeholder: In production this would upload to S3 and return the URL.
    // For now we store a placeholder URL using the original filename.
    const imageUrl = `${process.env.APP_URL || 'http://localhost:3000'}/uploads/${Date.now()}-${file.originalname}`;

    return this.prescriptionsService.create(user.id, dto, imageUrl);
  }

  @Get('mine')
  findMine(@CurrentUser() user: any) {
    return this.prescriptionsService.findByClient(user.id);
  }
}
