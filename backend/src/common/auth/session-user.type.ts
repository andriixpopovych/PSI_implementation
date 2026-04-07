import type { UserRole } from '../../generated/prisma/enums';

export type SessionUser = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
};
