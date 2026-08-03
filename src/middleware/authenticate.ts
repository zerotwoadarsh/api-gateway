import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { loadConfig, type RouteConfig } from '../config/loadConfig.js';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-me';

function findMatchingRoute(routes: RouteConfig[], requestPath: string): RouteConfig | undefined {
  return routes.find(
    (route) => requestPath === route.path || requestPath.startsWith(`${route.path}/`),
  );
}

// Factory instead of a bare middleware: loads config.yaml once at server
// startup (not on every request) and closes over the parsed routes, since
// re-reading and re-parsing the YAML file on every single request would be
// wasteful.
export function createAuthMiddleware() {
  const { routes } = loadConfig();

  // Mounted with no path (see proxy/router.ts for why) — this runs for
  // every request and decides for itself, from config.yaml, whether the
  // matched route needs a token. Requests to paths not in config.yaml
  // (like /health or /auth/token) pass straight through.
  return function authenticate(req: Request, res: Response, next: NextFunction): void {
    const route = findMatchingRoute(routes, req.path);
    const requiresAuth = route ? route.protected !== false : false;

    if (!requiresAuth) {
      next();
      return;
    }

    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing or malformed Authorization header',
      });
      return;
    }

    const token = authHeader.slice('Bearer '.length);

    try {
      // Explicitly restrict accepted algorithms rather than trusting
      // whatever the token header claims — this avoids algorithm-confusion
      // attacks where a token is crafted to use a different algorithm than
      // the server intends to verify with.
      req.user = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
      next();
    } catch (err) {
      res.status(401).json({ error: 'Unauthorized', message: (err as Error).message });
    }
  };
}
