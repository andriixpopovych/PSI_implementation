import {
  BadRequestException,
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
import { CreatePlacementVariantDto } from "./dto/create-object.dto";
import { UpdateObjectDto } from "./dto/update-object.dto";
import { UpdateObjectStatusDto } from "./dto/update-object-status.dto";
import { UpdatePlacementVariantDto } from "./dto/update-placement-variant.dto";

@Injectable()
export class ObjectsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async create(user: SessionUser, payload: CreateObjectDto) {
    if (user.role !== UserRole.HOST && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        "Only hosts can create accommodation objects.",
      );
    }

    const variantsToCreate = payload.variants?.length
      ? payload.variants
      : payload.initialVariant
        ? [payload.initialVariant]
        : [];

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
        variants: variantsToCreate.length
          ? {
              create: variantsToCreate.map((variant) => ({
                title: variant.title,
                photoUrl: variant.photoUrl,
                type: variant.type,
                guests: variant.guests,
                bedrooms: variant.bedrooms,
                bathrooms: variant.bathrooms,
                pricePerNight: variant.pricePerNight,
                pricePerMonth: variant.pricePerMonth,
                isActive: variant.isActive ?? true,
              })),
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
      message: variantsToCreate.length
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

  async getById(id: string, user?: SessionUser) {
    const object = await this.prisma.accommodationObject.findUnique({
      where: { id },
      include: {
        host: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        variants: {
          orderBy: { pricePerNight: "asc" },
        },
      },
    });

    if (!object) {
      throw new NotFoundException("Accommodation object not found.");
    }

    const canViewDraft =
      user?.role === UserRole.ADMIN || object.hostId === user?.id;

    if (object.status !== ListingStatus.APPROVED && !canViewDraft) {
      throw new NotFoundException("Accommodation object not found.");
    }

    return {
      data: serializeObject({
        ...object,
        variants:
          object.status === ListingStatus.APPROVED && !canViewDraft
            ? object.variants.filter((variant) => variant.isActive)
            : object.variants,
      }),
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

  async update(user: SessionUser, objectId: string, payload: UpdateObjectDto) {
    const existingObject = await this.ensureCanManageObject(user, objectId);

    const updatedObject = await this.prisma.accommodationObject.update({
      where: { id: existingObject.id },
      data: {
        ...(payload.title !== undefined ? { title: payload.title } : {}),
        ...(payload.description !== undefined
          ? { description: payload.description }
          : {}),
        ...(payload.city !== undefined ? { city: payload.city } : {}),
        ...(payload.country !== undefined ? { country: payload.country } : {}),
        ...(payload.address !== undefined ? { address: payload.address } : {}),
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
          orderBy: { pricePerNight: "asc" },
        },
      },
    });

    return {
      message: "Accommodation object updated.",
      data: serializeObject(updatedObject),
    };
  }

  async createVariant(
    user: SessionUser,
    objectId: string,
    payload: CreatePlacementVariantDto,
  ) {
    await this.ensureCanManageObject(user, objectId);

    const variant = await this.prisma.placementVariant.create({
      data: {
        objectId,
        title: payload.title,
        photoUrl: payload.photoUrl,
        type: payload.type,
        guests: payload.guests,
        bedrooms: payload.bedrooms,
        bathrooms: payload.bathrooms,
        pricePerNight: payload.pricePerNight,
        pricePerMonth: payload.pricePerMonth,
        isActive: payload.isActive ?? true,
      },
    });

    return {
      message: "Placement variant created.",
      data: {
        id: variant.id,
        title: variant.title,
        photoUrl: variant.photoUrl,
        type: variant.type,
        guests: variant.guests,
        bedrooms: variant.bedrooms,
        bathrooms: variant.bathrooms,
        pricePerNight: variant.pricePerNight,
        pricePerMonth: variant.pricePerMonth,
        isActive: variant.isActive,
      },
    };
  }

  async updateVariant(
    user: SessionUser,
    objectId: string,
    variantId: string,
    payload: UpdatePlacementVariantDto,
  ) {
    await this.ensureCanManageObject(user, objectId);
    await this.ensureVariantBelongsToObject(objectId, variantId);

    const variant = await this.prisma.placementVariant.update({
      where: { id: variantId },
      data: {
        ...(payload.title !== undefined ? { title: payload.title } : {}),
        ...(payload.photoUrl !== undefined ? { photoUrl: payload.photoUrl } : {}),
        ...(payload.type !== undefined ? { type: payload.type } : {}),
        ...(payload.guests !== undefined ? { guests: payload.guests } : {}),
        ...(payload.bedrooms !== undefined
          ? { bedrooms: payload.bedrooms }
          : {}),
        ...(payload.bathrooms !== undefined
          ? { bathrooms: payload.bathrooms }
          : {}),
        ...(payload.pricePerNight !== undefined
          ? { pricePerNight: payload.pricePerNight }
          : {}),
        ...(payload.pricePerMonth !== undefined
          ? { pricePerMonth: payload.pricePerMonth }
          : {}),
        ...(payload.isActive !== undefined ? { isActive: payload.isActive } : {}),
      },
    });

    return {
      message: "Placement variant updated.",
      data: {
        id: variant.id,
        title: variant.title,
        photoUrl: variant.photoUrl,
        type: variant.type,
        guests: variant.guests,
        bedrooms: variant.bedrooms,
        bathrooms: variant.bathrooms,
        pricePerNight: variant.pricePerNight,
        pricePerMonth: variant.pricePerMonth,
        isActive: variant.isActive,
      },
    };
  }

  async removeVariant(user: SessionUser, objectId: string, variantId: string) {
    await this.ensureCanManageObject(user, objectId);

    const variants = await this.prisma.placementVariant.findMany({
      where: { objectId },
      select: { id: true },
    });

    if (variants.length <= 1) {
      throw new BadRequestException(
        "At least one placement variant must remain on the object.",
      );
    }

    await this.ensureVariantBelongsToObject(objectId, variantId);

    await this.prisma.placementVariant.delete({
      where: { id: variantId },
    });

    return {
      message: "Placement variant removed.",
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

  private async ensureCanManageObject(user: SessionUser, objectId: string) {
    const object = await this.prisma.accommodationObject.findUnique({
      where: { id: objectId },
      include: {
        host: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        variants: {
          orderBy: { pricePerNight: "asc" },
        },
      },
    });

    if (!object) {
      throw new NotFoundException("Accommodation object not found.");
    }

    if (user.role !== UserRole.ADMIN && object.hostId !== user.id) {
      throw new ForbiddenException("You can manage only your own objects.");
    }

    return object;
  }

  private async ensureVariantBelongsToObject(objectId: string, variantId: string) {
    const variant = await this.prisma.placementVariant.findFirst({
      where: {
        id: variantId,
        objectId,
      },
    });

    if (!variant) {
      throw new NotFoundException("Placement variant not found.");
    }

    return variant;
  }
}
