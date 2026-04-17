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

  const locationPool = [
    { city: "Los Angeles", country: "USA" },
    { city: "Valencia", country: "Spain" },
    { city: "Lisbon", country: "Portugal" },
    { city: "Berlin", country: "Germany" },
    { city: "Prague", country: "Czechia" },
    { city: "Split", country: "Croatia" },
    { city: "Krakow", country: "Poland" },
    { city: "Vienna", country: "Austria" },
    { city: "Budapest", country: "Hungary" },
    { city: "Rome", country: "Italy" },
  ] as const;

  const titlePrefixPool = [
    "Sunset",
    "Urban",
    "Riverside",
    "Skyline",
    "Coastal",
    "Garden",
    "Central",
    "Lumen",
    "Aurora",
    "Modern",
  ] as const;

  const typePool = [
    PropertyType.APARTMENT,
    PropertyType.HOUSE,
    PropertyType.HOSTEL,
    PropertyType.VILLA,
    PropertyType.ROOM,
  ] as const;

  const variantTypePool = [
    PlacementVariantType.ENTIRE_PLACE,
    PlacementVariantType.PRIVATE_ROOM,
    PlacementVariantType.SHARED_ROOM,
    PlacementVariantType.STUDIO,
  ] as const;

  const createdObjects: Array<{
    id: string;
    variants: Array<{ id: string }>;
  }> = [];

  const TOTAL_OBJECTS = 120;

  for (let i = 0; i < TOTAL_OBJECTS; i += 1) {
    const location = locationPool[i % locationPool.length];
    const objectType = typePool[i % typePool.length];
    const titlePrefix = titlePrefixPool[i % titlePrefixPool.length];

    const status =
      i % 10 < 7
        ? ListingStatus.APPROVED
        : i % 10 < 9
          ? ListingStatus.PENDING
          : ListingStatus.REJECTED;

    const variantsToCreate = Array.from(
      { length: 1 + (i % 4) },
      (_, variantIndex) => {
        const type =
          variantTypePool[(i + variantIndex) % variantTypePool.length];
        const guests = Math.min(
          8,
          1 +
            ((i + variantIndex) % 6) +
            (type === PlacementVariantType.ENTIRE_PLACE ? 2 : 0),
        );
        const bedrooms =
          type === PlacementVariantType.SHARED_ROOM
            ? 1
            : 1 + ((i + variantIndex) % 4);
        const bathrooms = Math.max(1, Math.floor((bedrooms + 1) / 2));
        const pricePerNight = 45 + ((i * 17 + variantIndex * 23) % 320);

        return {
          title: `${type.replaceAll("_", " ").toLowerCase()} option ${variantIndex + 1}`,
          type,
          guests,
          bedrooms,
          bathrooms,
          pricePerNight,
          pricePerMonth: pricePerNight * 22,
        };
      },
    );

    const created = await prisma.accommodationObject.create({
      data: {
        title: `${titlePrefix} ${objectType.toLowerCase()} #${i + 1}`,
        description:
          "Generated demo listing for stress-testing catalog, search and reservation flows with many records.",
        type: objectType,
        city: location.city,
        country: location.country,
        address: `${10 + i} Smart Lane, ${location.city}`,
        status,
        hostId: host.id,
        variants: {
          create: variantsToCreate,
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

  const approvedWithVariants = createdObjects.filter(
    (item) => item.variants.length > 0,
  );
  const firstObject = approvedWithVariants[0];
  const secondObject = approvedWithVariants[1] ?? approvedWithVariants[0];

  await prisma.reservation.create({
    data: {
      userId: guest.id,
      objectId: firstObject.id,
      variantId: firstObject.variants[0]?.id,
      startDate: new Date("2027-03-12T14:00:00.000Z"),
      endDate: new Date("2027-03-25T10:00:00.000Z"),
      guests: 2,
      status: ReservationStatus.ACTIVE,
    },
  });

  await prisma.reservation.create({
    data: {
      userId: guest.id,
      objectId: secondObject.id,
      variantId: secondObject.variants[0]?.id,
      startDate: new Date("2026-11-07T14:00:00.000Z"),
      endDate: new Date("2026-11-21T10:00:00.000Z"),
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
