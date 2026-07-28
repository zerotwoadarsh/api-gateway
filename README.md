# API Gateway

A production-style API Gateway built with Node.js and TypeScript — handling routing,
authentication, rate limiting, caching, and observability for a set of backend microservices.

## Project Goals

- [ ] Reverse proxy / request routing to multiple backend services
- [ ] Config-driven routing (YAML)
- [ ] JWT-based authentication at the gateway layer
- [ ] Rate limiting (custom token bucket implementation)
- [ ] Response caching with Redis
- [ ] Circuit breaker for resilient service calls
- [ ] Health checks and load balancing across service instances
- [ ] Prometheus metrics + Grafana dashboard
- [ ] Admin dashboard for live route/traffic visibility
- [ ] Fully Dockerized (gateway + services + Redis + Prometheus)

## Architecture

> Filled in as components are built. Planned structure:

```
api-gateway/
├── src/
│   ├── config/         # route configs, env, YAML loader
│   ├── middleware/      # auth, rate limiting, caching, circuit breaker
│   ├── proxy/           # routing + load balancing
│   ├── metrics/         # Prometheus metrics
│   ├── admin/           # admin API routes
│   └── index.ts
├── services/             # dummy backend services for local testing
├── docker-compose.yml
└── config.yaml
```

## Tech Stack

| Concern         | Tool                                      |
| --------------- | ------------------------------------------ |
| Runtime         | Node.js + TypeScript                      |
| Framework       | TBD (Express / Fastify)                   |
| Auth            | jsonwebtoken                              |
| Rate limiting   | Custom token bucket, later Redis-backed   |
| Caching         | Redis                                     |
| Circuit breaker | opossum                                   |
| Metrics         | prom-client                               |
| Logging         | pino                                      |

## Getting Started

```bash
npm install
npm run dev
```

## Scripts

| Command               | Description                          |
| ---------------------- | ------------------------------------- |
| `npm run dev`          | Run the gateway in watch mode         |
| `npm run build`        | Compile TypeScript to `dist/`         |
| `npm start`            | Run the compiled build                |
| `npm run lint`         | Lint the codebase                     |
| `npm run lint:fix`     | Lint and auto-fix                     |
| `npm run format`       | Format the codebase with Prettier     |
| `npm run format:check` | Check formatting without writing      |

## Status

🚧 Foundation set up — routing and middleware coming next.
