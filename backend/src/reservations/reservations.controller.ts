import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";

import { AuthenticatedGuard } from "../common/auth/authenticated.guard";
import { CurrentUser } from "../common/auth/current-user.decorator";
import type { SessionUser } from "../common/auth/session-user.type";
import { CancelReservationDto } from "./dto/cancel-reservation.dto";
import { ReservationsService } from "./reservations.service";
import { CreateReservationDto } from "./dto/create-reservation.dto";

@Controller()
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @UseGuards(AuthenticatedGuard)
  @Get("me/reservations")
  getMine(@CurrentUser() user: SessionUser) {
    return this.reservationsService.getMine(user);
  }

  @UseGuards(AuthenticatedGuard)
  @Patch("reservations/:id/cancel")
  cancel(
    @CurrentUser() user: SessionUser,
    @Param("id") reservationId: string,
    @Body() payload: CancelReservationDto,
  ) {
    return this.reservationsService.cancel(user, reservationId, payload);
  }

  @UseGuards(AuthenticatedGuard)
  @Post("reservations")
  create(
    @CurrentUser() user: SessionUser,
    @Body() createDto: CreateReservationDto,
  ) {
    return this.reservationsService.create(user, createDto);
  }
}
