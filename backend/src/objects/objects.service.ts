import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import type { SessionUser } from "../common/auth/session-user.type";
import { serializeObject } from "../common/serializers";
import { ListingStatus, UserRole } from "../generated/prisma/enums";
import { PrismaService } from "../prisma/prisma.service";
import { CreateObjectDto } from "./dto/create-object.dto";
import { UpdateObjectStatusDto } from "./dto/update-object-status.dto";

@Injectable()
export class ObjectsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async create(user: SessionUser, payload: CreateObjectDto) {
    if (user.role !== UserRole.HOST && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        "Only hosts can create accommodation objects.",
      );
    }

    const object = await this.prisma.accommodationObject.create({
      data: {
        title: payload.title,
        description: payload.description,
        type: payload.type,
        city: payload.city,
        country: payload.country,
        address: payload.address,
        status:
          user.role === UserRole.ADMIN
            ? ListingStatus.APPROVED
            : ListingStatus.PENDING,
        hostId: user.id,
        variants: payload.initialVariant
          ? {
              create: {
                title: payload.initialVariant.title,
                type: payload.initialVariant.type,
                guests: payload.initialVariant.guests,
                bedrooms: payload.initialVariant.bedrooms,
                bathrooms: payload.initialVariant.bathrooms,
                pricePerNight: payload.initialVariant.pricePerNight,
                pricePerMonth: payload.initialVariant.pricePerMonth,
                isActive: payload.initialVariant.isActive ?? true,
              },
            }
          : undefined,
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
      message: payload.initialVariant
        ? "Object created and sent for approval."
        : "Object created without rooms.",
      data: serializeObject(object),
    };
  }

  async getPublicById(id: string) {
    const object = await this.prisma.accommodationObject.findFirst({
      where: {
        id,
        status: ListingStatus.APPROVED,
      },
      include: {
        host: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        variants: {
          where: { isActive: true },
          orderBy: { pricePerNight: "asc" },
        },
      },
    });

    if (!object) {
      throw new NotFoundException("Accommodation object not found.");
    }

    return {
      data: serializeObject(object),
    };
  }

  async getMine(user: SessionUser) {
    const objects = await this.prisma.accommodationObject.findMany({
      where: {
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
        variants: {
          orderBy: {
            pricePerNight: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      count: objects.length,
      data: objects.map(serializeObject),
    };
  }

  async getForModeration(user: SessionUser, status?: ListingStatus) {
    this.ensureAdmin(user);

    const objects = await this.prisma.accommodationObject.findMany({
      where: status ? { status } : undefined,
      include: {
        host: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        variants: {
          orderBy: {
            pricePerNight: "asc",
          },
        },
      },
      orderBy: [
        {
          status: "asc",
        },
        {
          createdAt: "desc",
        },
      ],
    });

    return {
      count: objects.length,
      data: objects.map(serializeObject),
    };
  }

  async updateStatus(
    user: SessionUser,
    objectId: string,
    payload: UpdateObjectStatusDto,
  ) {
    this.ensureAdmin(user);

    const existingObject = await this.prisma.accommodationObject.findUnique({
      where: { id: objectId },
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

    if (!existingObject) {
      throw new NotFoundException("Accommodation object not found.");
    }

    const updatedObject = await this.prisma.accommodationObject.update({
      where: { id: objectId },
      data: {
        status: payload.status,
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
      message:
        payload.status === ListingStatus.APPROVED
          ? "Listing approved."
          : payload.status === ListingStatus.REJECTED
            ? "Listing rejected."
            : "Listing moved back to pending.",
      note: payload.note ?? null,
      data: serializeObject(updatedObject),
    };
  }

  private ensureAdmin(user: SessionUser) {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException("Only managers can moderate listings.");
    }
  }
}
