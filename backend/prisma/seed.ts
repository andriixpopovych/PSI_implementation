import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import {
  ListingStatus,
  PlacementVariantType,
  PrismaClient,
  PropertyType,
  ReservationStatus,
  UserRole,
} from "../src/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? "",
});

const prisma = new PrismaClient({
  adapter,
});

const photoPool = [
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1505693539055-6f67ad24f4b3?auto=format&fit=crop&w=1200&q=80",
] as const;

const objectBlueprints = [
  ["Riverside Loft", "Bratislava", "Slovakia", "12 Danube Avenue", PropertyType.APARTMENT],
  ["Old Town Studio", "Prague", "Czechia", "8 Charles Street", PropertyType.ROOM],
  ["Garden Villa Escape", "Split", "Croatia", "21 Olive Grove", PropertyType.VILLA],
  ["Skyline Flat", "Vienna", "Austria", "31 Ring Road", PropertyType.APARTMENT],
  ["Central Artist House", "Berlin", "Germany", "15 Linden Court", PropertyType.HOUSE],
  ["Harbor Light Stay", "Lisbon", "Portugal", "4 Alfama Steps", PropertyType.APARTMENT],
  ["Amber City Rooms", "Krakow", "Poland", "55 Market Square", PropertyType.HOSTEL],
  ["Sunset Terrace Home", "Valencia", "Spain", "19 Orange Lane", PropertyType.HOUSE],
  ["Opera View Suite", "Budapest", "Hungary", "2 Liberty Street", PropertyType.APARTMENT],
  ["Cedar Corner Flat", "Rome", "Italy", "44 Via Nova", PropertyType.APARTMENT],
  ["Canal Side Residence", "Amsterdam", "Netherlands", "6 Water Alley", PropertyType.HOUSE],
  ["Nordic Calm Studio", "Copenhagen", "Denmark", "9 Harbor Walk", PropertyType.ROOM],
  ["Seaside White Villa", "Dubrovnik", "Croatia", "3 Pearl Bay", PropertyType.VILLA],
  ["Metro Nest Apartment", "Warsaw", "Poland", "78 River Boulevard", PropertyType.APARTMENT],
  ["Courtyard Guest House", "Ljubljana", "Slovenia", "14 Castle Yard", PropertyType.HOUSE],
  ["Hilltop Light Room", "Porto", "Portugal", "11 Vineyard Path", PropertyType.ROOM],
  ["Modern Base Hostel", "Madrid", "Spain", "26 Sol Plaza", PropertyType.HOSTEL],
  ["Stone Arch Loft", "Florence", "Italy", "7 Arno Lane", PropertyType.APARTMENT],
  ["Blue Pine Retreat", "Salzburg", "Austria", "18 Alpine View", PropertyType.VILLA],
  ["Quiet Corner Home", "Brno", "Czechia", "39 Garden Street", PropertyType.HOUSE],
] as const;

async function main() {
  await prisma.reservation.deleteMany();
  await prisma.placementVariant.deleteMany();
  await prisma.accommodationObject.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("demo1234", 12);

  const host = await prisma.user.create({
    data: {
      email: "host@staysmart.app",
      passwordHash,
      fullName: "Stay Smart Host",
      role: UserRole.HOST,
    },
  });

  const guest = await prisma.user.create({
    data: {
      email: "guest@staysmart.app",
      passwordHash,
      fullName: "Stay Smart Guest",
      role: UserRole.GUEST,
    },
  });

  await prisma.user.create({
    data: {
      email: "manager@staysmart.app",
      passwordHash,
      fullName: "Stay Smart Manager",
      role: UserRole.ADMIN,
    },
  });

  const createdObjects: Array<{
    id: string;
    variants: Array<{ id: string }>;
  }> = [];

  for (const [index, blueprint] of objectBlueprints.entries()) {
    const [title, city, country, address, type] = blueprint;
    const baseNight = 70 + index * 7;
    const created = await prisma.accommodationObject.create({
      data: {
        title,
        description:
          "Curated demo listing with multiple placement variants, individual photos and clean approved state for the host management flow.",
        type,
        city,
        country,
        address,
        status: ListingStatus.APPROVED,
        hostId: host.id,
        variants: {
          create: [
            {
              title: "Main stay",
              photoUrl: photoPool[index % photoPool.length],
              type:
                type === PropertyType.ROOM
                  ? PlacementVariantType.PRIVATE_ROOM
                  : PlacementVariantType.ENTIRE_PLACE,
              guests: type === PropertyType.VILLA ? 6 : 2 + (index % 3),
              bedrooms: type === PropertyType.ROOM ? 1 : 1 + (index % 3),
              bathrooms: type === PropertyType.VILLA ? 2 : 1,
              pricePerNight: baseNight,
              pricePerMonth: baseNight * 22,
              isActive: true,
            },
            {
              title: "Flex option",
              photoUrl: photoPool[(index + 1) % photoPool.length],
              type:
                type === PropertyType.HOSTEL
                  ? PlacementVariantType.SHARED_ROOM
                  : PlacementVariantType.STUDIO,
              guests: type === PropertyType.HOSTEL ? 1 : 2 + ((index + 1) % 2),
              bedrooms: 1,
              bathrooms: 1,
              pricePerNight: baseNight + 18,
              pricePerMonth: (baseNight + 18) * 22,
              isActive: true,
            },
            {
              title: "Premium view",
              photoUrl: photoPool[(index + 2) % photoPool.length],
              type: PlacementVariantType.ENTIRE_PLACE,
              guests: type === PropertyType.VILLA ? 8 : 3 + (index % 2),
              bedrooms: type === PropertyType.ROOM ? 1 : 2 + (index % 2),
              bathrooms: type === PropertyType.VILLA ? 3 : 2,
              pricePerNight: baseNight + 35,
              pricePerMonth: (baseNight + 35) * 22,
              isActive: true,
            },
          ],
        },
      },
      include: {
        variants: {
          select: {
            id: true,
          },
        },
      },
    });

    createdObjects.push(created);
  }

  await prisma.reservation.create({
    data: {
      userId: guest.id,
      objectId: createdObjects[0].id,
      variantId: createdObjects[0].variants[0]?.id,
      startDate: new Date("2027-03-12T14:00:00.000Z"),
      endDate: new Date("2027-03-25T10:00:00.000Z"),
      guests: 2,
      status: ReservationStatus.ACTIVE,
    },
  });

  await prisma.reservation.create({
    data: {
      userId: guest.id,
      objectId: createdObjects[1].id,
      variantId: createdObjects[1].variants[1]?.id,
      startDate: new Date("2026-11-07T14:00:00.000Z"),
      endDate: new Date("2026-11-14T10:00:00.000Z"),
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
