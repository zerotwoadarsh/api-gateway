import { Router, json } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-me';

export const devAuthRouter = Router();

// DEV-ONLY convenience endpoint. A real gateway never issues its own
// tokens — that's the job of a proper identity provider (Auth0, Cognito,
// your own auth service, etc). This exists purely so protected routes can
// be tested locally without standing one up.
//
// `json()` is scoped to just this one route, not applied globally — a
// global body parser would consume the request stream before it reaches
// the proxy, breaking POST/PUT bodies forwarded to backend services.
devAuthRouter.post('/auth/token', json(), (req, res) => {
  const username = typeof req.body?.username === 'string' ? req.body.username : 'demo-user';
  const token = jwt.sign({ sub: username }, JWT_SECRET, { expiresIn: '1h', algorithm: 'HS256' });
  res.json({ token });
});
