import { Inject, Injectable } from "@nestjs/common";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  limit: number;
}

@Injectable()
export class RateLimitService {
  private readonly DAILIY_LIMIT = 3; // Example daily limit

  constructor(@Inject("REDIS_CLIENT") private readonly redisClient: any) { }

  async checkLimit(indetifier: string): Promise<RateLimitResult> {
    const key = this.buildKey(indetifier);
    const now = new Date();

    // get current count
    const current = await this.redisClient.get(key);
    const count = current ? parseInt(current, 10) : 0;

    // get TTL for reset time
    const ttl = await this.redisClient.ttl(key);
    const resetAt = ttl > 0 ? new Date(now.getTime() + ttl * 1000) : this.getEndOfDay();

    if (count >= this.DAILIY_LIMIT) {
      return { allowed: false, remaining: 0, resetAt, limit: this.DAILIY_LIMIT };
    }

    return {
      allowed: true,
      remaining: this.DAILIY_LIMIT - count,
      resetAt,
      limit: this.DAILIY_LIMIT
    }
  }

  async increment(identifier: string): Promise<void> {
    const key = this.buildKey(identifier);
    const exists = await this.redisClient.exists(key);

    // increment count
    await this.redisClient.incr(key);

    // set expiration if it's a new key
    if (!exists) {
      const ttl = this.getSecondsUntilMidnight();
      await this.redisClient.expire(key, ttl);
    }
  }

  async getUsage(identifier: string): Promise<RateLimitResult> {
    const key = this.buildKey(identifier);
    const current = await this.redisClient.get(key);
    const count = current ? parseInt(current, 10) : 0;
    const ttl = await this.redisClient.ttl(key);
    const now = new Date();

    return {
      allowed: count < this.DAILIY_LIMIT,
      remaining: Math.max(0, this.DAILIY_LIMIT - count),
      resetAt: ttl > 0 ? new Date(now.getTime() + ttl * 1000) : this.getEndOfDay(),
      limit: this.DAILIY_LIMIT
    }
  }

  private buildKey(identifier: string): string {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    return `audit:limit:${identifier}:${today}`;
  }

  private getEndOfDay(): Date {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return end;
  }
  private getSecondsUntilMidnight(): number {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    return Math.floor((midnight.getTime() - now.getTime()) / 1000);
  }
}