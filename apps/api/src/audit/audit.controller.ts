import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service.js';
import { CreateAuditDto } from './dto/create-audit.dto.js';
import { RateLimitService } from '../redis/rate-limit.service.js';
import type { Request } from 'express';
import { RateLimitGuard } from '../redis/rate-limit.guard.js';

@Controller('audit')
export class AuditController {
  // eslint-disable-next-line prettier/prettier
  constructor(
    private readonly auditService: AuditService,
    private readonly rateLimitService: RateLimitService
  ) { }

  @Post()
  @UseGuards(RateLimitGuard)
  async create(@Body() dto: CreateAuditDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.auditService.create(dto);
  }

  @Get('usage')
  async getUsage(@Req() req: Request) {
    const identifier = this.getIdentifier(req);
    return this.rateLimitService.getUsage(identifier);
  }

  private getIdentifier(request: Request): string {
    // Get real IP address behind proxies
    const forwarded = request.headers['x-forwarded-for'];
    const ip = forwarded
      ? (forwarded as string).split(',')[0].trim()
      : request.ip;

    return ip ?? 'unknown';
  }
}
