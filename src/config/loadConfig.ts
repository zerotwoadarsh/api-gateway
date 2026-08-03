import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { parse } from 'yaml';

export interface RouteConfig {
  /** Path prefix on the gateway that triggers this route, e.g. "/users" */
  path: string;
  /** Base URL of the backend service to forward matching requests to */
  target: string;
  /** Whether requests to this route require a valid JWT. Defaults to true if omitted. */
  protected?: boolean;
}

interface GatewayConfig {
  routes: RouteConfig[];
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Works whether we're running from src/ (tsx, dev) or dist/ (tsc build) —
// both sit two levels below the project root.
const CONFIG_PATH = process.env.GATEWAY_CONFIG_PATH ?? path.resolve(__dirname, '../../config.yaml');

function isRouteConfig(value: unknown): value is RouteConfig {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  if (typeof candidate.path !== 'string' || typeof candidate.target !== 'string') {
    return false;
  }

  return candidate.protected === undefined || typeof candidate.protected === 'boolean';
}

function assertValidConfig(value: unknown): asserts value is GatewayConfig {
  if (typeof value !== 'object' || value === null || !('routes' in value)) {
    throw new Error(`Invalid gateway config at ${CONFIG_PATH}: missing top-level "routes" key`);
  }

  const routes = (value as { routes: unknown }).routes;

  if (!Array.isArray(routes) || routes.length === 0) {
    throw new Error(`Invalid gateway config at ${CONFIG_PATH}: "routes" must be a non-empty array`);
  }

  routes.forEach((route: unknown, index: number) => {
    if (!isRouteConfig(route)) {
      throw new Error(
        `Invalid gateway config at ${CONFIG_PATH}: routes[${index}] must have string "path" and "target" fields`,
      );
    }
  });
}

// Fails fast and loudly on a bad config — better to crash on startup with a
// clear message than to silently drop a route and debug it via 404s later.
export function loadConfig(): GatewayConfig {
  let raw: string;

  try {
    raw = readFileSync(CONFIG_PATH, 'utf-8');
  } catch (err) {
    throw new Error(`Could not read gateway config at ${CONFIG_PATH}: ${(err as Error).message}`);
  }

  const parsed: unknown = parse(raw);
  assertValidConfig(parsed);

  return parsed;
}
