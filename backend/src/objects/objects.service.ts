import { ForbiddenException, Injectable } from '@nestjs/common';

import type { SessionUser } from '../common/auth/session-user.type';
import { serializeObject } from '../common/serializers';
import { UserRole } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { CreateObjectDto } from './dto/create-object.dto';

@Injectable()
export class ObjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: SessionUser, payload: CreateObjectDto) {
    if (user.role !== UserRole.HOST && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only hosts can create accommodation objects.');
    }

    const object = await this.prisma.accommodationObject.create({
      data: {
        title: payload.title,
        description: payload.description,
        type: payload.type,
        city: payload.city,
        country: payload.country,
        address: payload.address,
        hostId: user.id,
      },
      include: {
        host: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        variants: true,
      },
    });

    return {
      message: 'Object created without rooms.',
      data: serializeObject(object),
    };
  }
}
