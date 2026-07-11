import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { RateLimitService } from "./rate-limit.service";
import { Request, Response } from 'express';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(private readonly rateLimitService: RateLimitService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    // user IP address ad identifier for rate limiting
    const identifier = this.getIdentifier(request)
    const result = await this.rateLimitService.checkLimit(identifier);

    response.setHeader('X-RateLimit-Limit', result.limit);
    response.setHeader('X-RateLimit-Remaining', result.remaining);
    response.setHeader('X-RateLimit-Reset', result.resetAt.toISOString());

    if (!result.allowed) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          error: 'Too Many Requests',
          message: `You have reached the daily limit of ${result.limit} audits. Resets at ${result.resetAt.toISOString()}.`,
          resetAt: result.resetAt,
          limit: result.limit,
        },
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    await this.rateLimitService.increment(identifier);
    return true;
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