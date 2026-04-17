import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import type { Request } from "express";

import { AuthenticatedGuard } from "../common/auth/authenticated.guard";
import { CurrentUser } from "../common/auth/current-user.decorator";
import { LocalAuthGuard } from "../common/auth/local-auth.guard";
import type { SessionUser } from "../common/auth/session-user.type";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

@Controller("auth")
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  @Post("register")
  register(@Body() payload: RegisterDto) {
    return this.authService.register(payload);
  }

  @UseGuards(LocalAuthGuard)
  @Post("login")
  login(@Body() _payload: LoginDto, @CurrentUser() user: SessionUser) {
    return {
      user,
    };
  }

  @UseGuards(AuthenticatedGuard)
  @Get("me")
  me(@CurrentUser() user: SessionUser) {
    return {
      user,
    };
  }

  @Post("logout")
  async logout(@Req() request: Request) {
    await new Promise<void>((resolve, reject) => {
      request.logout((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });

    return {
      success: true,
    };
  }
}
