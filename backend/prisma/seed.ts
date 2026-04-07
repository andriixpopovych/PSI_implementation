import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import {
  PlacementVariantType,
  PrismaClient,
  PropertyType,
  ReservationStatus,
  UserRole,
} from '../src/generated/prisma/client';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? '',
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  await prisma.reservation.deleteMany();
  await prisma.placementVariant.deleteMany();
  await prisma.accommodationObject.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('demo1234', 12);

  const host = await prisma.user.create({
    data: {
      email: 'host@staysmart.app',
      passwordHash,
      fullName: 'Stay Smart Host',
      role: UserRole.HOST,
    },
  });

  const guest = await prisma.user.create({
    data: {
      email: 'guest@staysmart.app',
      passwordHash,
      fullName: 'Stay Smart Guest',
      role: UserRole.GUEST,
    },
  });

  const villa = await prisma.accommodationObject.create({
    data: {
      title: 'Sunset Villa Modern',
      description: 'Sea-facing villa with flexible variants for short and medium stays.',
      type: PropertyType.VILLA,
      city: 'Valencia',
      country: 'Spain',
      address: '41 Palm Court, Valencia',
      hostId: host.id,
      variants: {
        create: [
          {
            title: 'Entire villa',
            type: PlacementVariantType.ENTIRE_PLACE,
            guests: 6,
            bedrooms: 4,
            bathrooms: 3,
            pricePerNight: 280,
            pricePerMonth: 4200,
          },
          {
            title: 'Private suite',
            type: PlacementVariantType.PRIVATE_ROOM,
            guests: 2,
            bedrooms: 1,
            bathrooms: 1,
            pricePerNight: 120,
            pricePerMonth: 1900,
          },
        ],
      },
    },
    include: {
      variants: true,
    },
  });

  const apartment = await prisma.accommodationObject.create({
    data: {
      title: 'Well Furnished Apartment',
      description: 'City apartment for longer stays with a clean and quiet layout.',
      type: PropertyType.APARTMENT,
      city: 'Los Angeles',
      country: 'USA',
      address: '100 Smart Street, Los Angeles',
      hostId: host.id,
      variants: {
        create: [
          {
            title: 'Full apartment',
            type: PlacementVariantType.ENTIRE_PLACE,
            guests: 4,
            bedrooms: 3,
            bathrooms: 1,
            pricePerNight: 160,
            pricePerMonth: 3200,
          },
        ],
      },
    },
    include: {
      variants: true,
    },
  });

  await prisma.accommodationObject.create({
    data: {
      title: 'Beach House Apartment',
      description: 'Object created without rooms yet. Host can add variants later.',
      type: PropertyType.HOUSE,
      city: 'Split',
      country: 'Croatia',
      address: '7 Coastline Ave, Split',
      hostId: host.id,
    },
  });

  await prisma.reservation.create({
    data: {
      userId: guest.id,
      objectId: apartment.id,
      variantId: apartment.variants[0]?.id,
      startDate: new Date('2027-03-12T14:00:00.000Z'),
      endDate: new Date('2027-03-25T10:00:00.000Z'),
      guests: 2,
      status: ReservationStatus.ACTIVE,
    },
  });

  await prisma.reservation.create({
    data: {
      userId: guest.id,
      objectId: villa.id,
      variantId: villa.variants[1]?.id,
      startDate: new Date('2026-11-07T14:00:00.000Z'),
      endDate: new Date('2026-11-21T10:00:00.000Z'),
      guests: 2,
      status: ReservationStatus.COMPLETED,
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
