import express, { type Express } from 'express';

import { createAuthMiddleware } from './middleware/authenticate.js';
import { requestLogger } from './middleware/requestLogger.js';
import { buildProxyRouter } from './proxy/router.js';
import { devAuthRouter } from './routes/authToken.js';

const PORT = process.env.GATEWAY_PORT ? Number(process.env.GATEWAY_PORT) : 3000;

export function createServer(): Express {
  const app = express();

  app.use(requestLogger);

  // Gateway's own health check — separate from backend service health,
  // which gets added when we introduce active health checks later.
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'api-gateway' });
  });

  app.use(devAuthRouter);

  app.use(createAuthMiddleware());
  app.use(buildProxyRouter());

  return app;
}

export function startServer(): void {
  const app = createServer();
  app.listen(PORT, () => {
    console.log(`🚀 API Gateway listening on http://localhost:${PORT}`);
  });
}
