import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { AuthenticatedGuard } from '../common/auth/authenticated.guard';
import { CurrentUser } from '../common/auth/current-user.decorator';
import type { SessionUser } from '../common/auth/session-user.type';
import { CreateObjectDto } from './dto/create-object.dto';
import { ObjectsService } from './objects.service';

@Controller('objects')
export class ObjectsController {
  constructor(private readonly objectsService: ObjectsService) {}

  @UseGuards(AuthenticatedGuard)
  @Post()
  create(@CurrentUser() user: SessionUser, @Body() payload: CreateObjectDto) {
    return this.objectsService.create(user, payload);
  }
}
