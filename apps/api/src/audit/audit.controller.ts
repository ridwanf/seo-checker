import { Body, Controller, Post } from '@nestjs/common';
import { AuditService } from './audit.service';
import { CreateAuditDto } from './dto/create-audit.dto';

@Controller('audits')
export class AuditController {
  // eslint-disable-next-line prettier/prettier
  constructor(
    private readonly auditService: AuditService
  ) { }

  @Post()
  async create(@Body() dto: CreateAuditDto) {
    return this.auditService.create(dto);
  }
}
