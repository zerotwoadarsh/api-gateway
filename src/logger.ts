import pino from 'pino';

const isDev = process.env.NODE_ENV !== 'production';

// Central logger — everything that needs to log (request logging now,
// auth/rate-limiting/circuit-breaker later) pulls from here so format
// and level stay consistent across the whole gateway.
export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  transport: isDev
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
});
