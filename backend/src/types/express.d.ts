import type { SessionUser } from '../common/auth/session-user.type';

declare global {
  namespace Express {
    interface User extends SessionUser {}
  }
}

export {};
