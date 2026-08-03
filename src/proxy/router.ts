import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

import { loadConfig } from '../config/loadConfig.js';

// pino-http attaches `id` to the request object, but we deliberately don't
// depend on its types here — this keeps the helper safe even if that
// attachment ever changes, and avoids coupling the proxy layer to a
// specific logging library's internals.
function getRequestId(req: unknown): string {
  if (typeof req === 'object' && req !== null && 'id' in req) {
    const id = (req as { id?: string | number }).id;
    if (id !== undefined) return String(id);
  }
  return 'unknown';
}

// Builds one reverse-proxy rule per entry in config.yaml.
// Each rule forwards anything under `path` to the matching `target`.
export function buildProxyRouter(): Router {
  const router = Router();
  const { routes } = loadConfig();

  for (const route of routes) {
    router.use(
      // Deliberately NOT `router.use(route.path, ...)`. Express treats a
      // path passed to `.use()` as a mount point and strips it from
      // `req.url` before the middleware runs — so a request to `/orders`
      // would arrive at the proxy as `/`, and get forwarded to the
      // target's `/` instead of `/orders`, breaking every route on the
      // target service. `pathFilter` matches against the *original*,
      // unstripped URL, so the full path reaches the target intact.
      createProxyMiddleware({
        target: route.target,
        changeOrigin: true,
        pathFilter: route.path,
        on: {
          // Forward the same request ID pino-http generated for this
          // request, so once the backend services also log, their logs
          // can be correlated back to this exact gateway request.
          proxyReq: (proxyReq, req) => {
            proxyReq.setHeader('X-Request-Id', getRequestId(req));
          },
        },
      }),
    );
  }

  return router;
}
