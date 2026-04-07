import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  async canActivate(context: ExecutionContext) {
    const activated = (await super.canActivate(context)) as boolean;
    const request = context.switchToHttp().getRequest();
    await super.logIn(request);
    return activated;
  }

  handleRequest<TUser = Express.User>(
    error: unknown,
    user: TUser | false,
    info?: { message?: string },
  ): TUser {
    if (error) {
      throw error;
    }

    if (!user) {
      throw new UnauthorizedException(info?.message ?? 'Invalid email or password.');
    }

    return user;
  }
}
