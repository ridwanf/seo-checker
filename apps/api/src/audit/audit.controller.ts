import { Body, Controller, Post } from '@nestjs/common';
import { AuditService } from './audit.service.js';
import { CreateAuditDto } from './dto/create-audit.dto.js';

@Controller('audit')
export class AuditController {
  // eslint-disable-next-line prettier/prettier
  constructor(
    private readonly auditService: AuditService
  ) { }

  @Post()
  async create(@Body() dto: CreateAuditDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.auditService.create(dto);
  }
}
