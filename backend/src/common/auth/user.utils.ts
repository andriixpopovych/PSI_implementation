import type { User } from '../../generated/prisma/client';

import type { SessionUser } from './session-user.type';

export function toSessionUser(user: Pick<User, 'id' | 'email' | 'fullName' | 'role'>): SessionUser {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
  };
}

export const toPublicUser = toSessionUser;
