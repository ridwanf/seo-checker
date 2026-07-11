import { Global, Module } from "@nestjs/common";
import Redis from "ioredis";
import { RateLimitService } from "./rate-limit.service";
import { RateLimitGuard } from "./rate-limit.guard";

export const REDIS_CLIENT = "REDIS_CLIENT";

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: () => {
        const redis = new Redis({
          host: process.env.REDIS_HOST || "localhost",
          port: parseInt(process.env.REDIS_PORT || "6379", 10),
          password: process.env.REDIS_PASSWORD || undefined,
        });

        redis.on('connect', () => console.log('Redis connecting...'))
        redis.on('error', (err) => console.log('Redis err', err))

        return redis
      }
    },
    RateLimitService,
    RateLimitGuard
  ],
  exports: [REDIS_CLIENT, RateLimitService, RateLimitGuard]
})
export class RedisModule { }