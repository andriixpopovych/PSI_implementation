import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

import type { SessionUser } from './session-user.type';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): SessionUser | undefined => {
    const request = context.switchToHttp().getRequest();
    return request.user;
  },
);
