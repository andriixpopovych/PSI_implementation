import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import type { SessionUser } from "../common/auth/session-user.type";
import { serializeReservation } from "../common/serializers";
import { ListingStatus, ReservationStatus } from "../generated/prisma/enums.js";
import { PrismaService } from "../prisma/prisma.service";
import { CancelReservationDto } from "./dto/cancel-reservation.dto";
import { CreateReservationDto } from "./dto/create-reservation.dto";

@Injectable()
export class ReservationsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async getMine(user: SessionUser) {
    const reservations = await this.prisma.reservation.findMany({
      where: { userId: user.id },
      include: { object: true, variant: true },
      orderBy: { startDate: "desc" },
    });

    return {
      count: reservations.length,
      data: reservations.map(serializeReservation),
    };
  }

  async cancel(
    user: SessionUser,
    reservationId: string,
    payload: CancelReservationDto,
  ) {
    const existingReservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!existingReservation || existingReservation.userId !== user.id) {
      throw new NotFoundException("Reservation not found.");
    }

    if (existingReservation.status !== ReservationStatus.ACTIVE) {
      throw new ConflictException("Only active reservations can be canceled.");
    }

    const updatedReservation = await this.prisma.reservation.update({
      where: { id: reservationId },
      data: {
        status: ReservationStatus.CANCELED,
        canceledAt: new Date(),
        cancelReason: payload.reason,
      },
      include: { object: true, variant: true },
    });

    return {
      message: "Reservation canceled.",
      data: serializeReservation(updatedReservation),
    };
  }

  async create(user: SessionUser, dto: CreateReservationDto) {
    const property = await this.prisma.accommodationObject.findUnique({
      where: { id: dto.propertyId },
      include: {
        variants: true,
      },
    });

    if (!property || property.status !== ListingStatus.APPROVED) {
      throw new NotFoundException("Accommodation object not found.");
    }

    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime()) ||
      startDate >= endDate
    ) {
      throw new ConflictException("Reservation dates are invalid.");
    }

    const variantId = dto.variantId ?? property.variants[0]?.id ?? null;

    if (dto.variantId) {
      const variant = property.variants.find(
        (item) => item.id === dto.variantId,
      );
      if (!variant || !variant.isActive) {
        throw new NotFoundException("Placement variant not found.");
      }

      if (dto.guestCount > variant.guests) {
        throw new ConflictException(
          "Guest count exceeds the selected placement capacity.",
        );
      }
    }

    const overlappingReservation = await this.prisma.reservation.findFirst({
      where: {
        objectId: dto.propertyId,
        ...(variantId ? { variantId } : {}),
        status: ReservationStatus.ACTIVE,
        startDate: {
          lt: endDate,
        },
        endDate: {
          gt: startDate,
        },
      },
    });

    if (overlappingReservation) {
      throw new ConflictException("Selected dates are already reserved.");
    }

    const reservation = await this.prisma.reservation.create({
      data: {
        user: { connect: { id: user.id } },
        object: { connect: { id: dto.propertyId } },
        ...(variantId ? { variant: { connect: { id: variantId } } } : {}),
        startDate,
        endDate,
        guests: dto.guestCount,
        status: ReservationStatus.ACTIVE,
      },
      include: {
        object: true,
        variant: true,
      },
    });

    return serializeReservation(reservation);
  }
}
