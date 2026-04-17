import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";

import { AuthenticatedGuard } from "../common/auth/authenticated.guard";
import { CurrentUser } from "../common/auth/current-user.decorator";
import type { SessionUser } from "../common/auth/session-user.type";
import { ListingStatus } from "../generated/prisma/enums";
import { CreateObjectDto } from "./dto/create-object.dto";
import { ObjectsService } from "./objects.service";
import { UpdateObjectStatusDto } from "./dto/update-object-status.dto";

@Controller("objects")
export class ObjectsController {
  constructor(
    @Inject(ObjectsService)
    private readonly objectsService: ObjectsService,
  ) {}

  @UseGuards(AuthenticatedGuard)
  @Post()
  create(@CurrentUser() user: SessionUser, @Body() payload: CreateObjectDto) {
    return this.objectsService.create(user, payload);
  }

  @UseGuards(AuthenticatedGuard)
  @Get("/me/listings")
  getMine(@CurrentUser() user: SessionUser) {
    return this.objectsService.getMine(user);
  }

  @UseGuards(AuthenticatedGuard)
  @Get("/manager/review")
  getForModeration(
    @CurrentUser() user: SessionUser,
    @Query("status") status?: ListingStatus,
  ) {
    return this.objectsService.getForModeration(user, status);
  }

  @UseGuards(AuthenticatedGuard)
  @Patch("/manager/:id/status")
  updateStatus(
    @CurrentUser() user: SessionUser,
    @Param("id") id: string,
    @Body() payload: UpdateObjectStatusDto,
  ) {
    return this.objectsService.updateStatus(user, id, payload);
  }

  @Get(":id")
  getById(@Param("id") id: string) {
    return this.objectsService.getPublicById(id);
  }
}
