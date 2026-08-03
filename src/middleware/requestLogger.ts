import { randomUUID } from 'node:crypto';

import pinoHttp from 'pino-http';

import { logger } from '../logger.js';

// One structured log line per request/response, tagged with a request ID.
// If a caller already sent X-Request-Id (e.g. from another service, or a
// client that generates its own), we reuse it instead of minting a new one,
// so a single request can be traced across hops instead of getting a fresh
// ID at every layer.
export const requestLogger = pinoHttp({
  logger,
  genReqId: (req, res) => {
    const existing = req.headers['x-request-id'];
    const id = typeof existing === 'string' ? existing : randomUUID();
    res.setHeader('X-Request-Id', id);
    return id;
  },
  customLogLevel: (_req, res, err) => {
    if (err || res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
});
