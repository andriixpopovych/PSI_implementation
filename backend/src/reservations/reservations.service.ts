import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import type { SessionUser } from '../common/auth/session-user.type';
import { serializeReservation } from '../common/serializers';
import { ReservationStatus } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { CancelReservationDto } from './dto/cancel-reservation.dto';

@Injectable()
export class ReservationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getMine(user: SessionUser) {
    const reservations = await this.prisma.reservation.findMany({
      where: {
        userId: user.id,
      },
      include: {
        object: true,
        variant: true,
      },
      orderBy: {
        startDate: 'desc',
      },
    });

    return {
      count: reservations.length,
      data: reservations.map(serializeReservation),
    };
  }

  async cancel(user: SessionUser, reservationId: string, payload: CancelReservationDto) {
    const existingReservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!existingReservation || existingReservation.userId !== user.id) {
      throw new NotFoundException('Reservation not found.');
    }

    if (existingReservation.status !== ReservationStatus.ACTIVE) {
      throw new ConflictException('Only active reservations can be canceled.');
    }

    const updatedReservation = await this.prisma.reservation.update({
      where: { id: reservationId },
      data: {
        status: ReservationStatus.CANCELED,
        canceledAt: new Date(),
        cancelReason: payload.reason,
      },
      include: {
        object: true,
        variant: true,
      },
    });

    return {
      message: 'Reservation canceled.',
      data: serializeReservation(updatedReservation),
    };
  }
}
