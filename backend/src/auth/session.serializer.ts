import { Inject, Injectable } from "@nestjs/common";
import { PassportSerializer } from "@nestjs/passport";

import type { SessionUser } from "../common/auth/session-user.type";
import { AuthService } from "./auth.service";

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {
    super();
  }

  serializeUser(
    user: SessionUser,
    done: (error: Error | null, id?: string) => void,
  ) {
    done(null, user.id);
  }

  async deserializeUser(
    id: string,
    done: (error: Error | null, user?: SessionUser | false) => void,
  ) {
    try {
      const user = await this.authService.findSessionUser(id);
      done(null, user ?? false);
    } catch (error) {
      done(error as Error);
    }
  }
}
