import type { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      /** Populated by the auth middleware after verifying a JWT. */
      user?: string | JwtPayload;
    }
  }
}

export {};
